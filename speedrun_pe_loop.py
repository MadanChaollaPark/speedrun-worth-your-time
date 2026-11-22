#!/usr/bin/env python3
"""
speedrun_pe_loop.py — exclusive driver for /workspace/speedrun-pe.

DO NOT EDIT from other tasks on this shared box. Unique filename on purpose.
If the on-disk SHA-256 drifts from STATE/DRIVER_SHA256, this process exits.
"""
from __future__ import annotations

import datetime
import hashlib
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
import zoneinfo
from pathlib import Path

KST = zoneinfo.ZoneInfo("Asia/Seoul")
ROOT = Path("/workspace/speedrun-pe")
DRIVER_PATH = Path(__file__).resolve()
K = os.path.expanduser("~/.local/bin/kiro-cli")
CODEX = os.path.expanduser("~/.local/bin/codex")

# Roles (owner decision — do not revert)
# Orchestrator + reviewer: kiro-cli claude-opus-5.5
# Builder: Codex gpt-6.2-sol, high reasoning, slow/standard (fast_mode=false)
OPUS_ARGS = ["--model", "claude-opus-5.5", "--effort", "high"]
SOL_MODEL = "gpt-6.2-sol"
OWNER_REVIEW = (
    "Orchestrator and reviewer are Kiro Claude Opus 5.5; builder is Codex "
    "gpt-6.2-sol at high reasoning effort / slow mode, by owner decision "
    "2026-11-22; do not revert"
)

# Timeouts (kill process group, then retry)
OPUS_TIMEOUT = 20 * 60      # 20 minutes for plan / review
BUILDER_TIMEOUT = 75 * 60   # 75 minutes for build
GIT_TIMEOUT = 300
MAX_TRIES = 3
RETRY_SLEEP = 30
STOP_AFTER_FAILED_CALLS = 6

# Credit / auth failure signals — after repeated hits, swap the engine for that role
AUTH_RE = re.compile(
    r"credit|quota|limit exceeded|insufficient(?:_quota)?|unauthorized|"
    r"not logged in|authentication (?:failed|required|error)|invalid.?api.?key|"
    r"please (?:log|sign) ?in|refresh token|401 unauthorized|payment required|"
    r"usage limit|out of credits|rate.?limit exceeded",
    re.I,
)

# Deadline: 20 hours from first launch, or LOOP_DEADLINE / LOOP_HOURS env.
def _deadline() -> tuple[datetime.datetime, datetime.datetime]:
    raw = os.environ.get("LOOP_DEADLINE")
    if raw:
        end = datetime.datetime.fromisoformat(raw).astimezone(KST)
        hours = float(os.environ.get("LOOP_HOURS", "20"))
        start = end - datetime.timedelta(hours=hours)
        return start, end
    hours = float(os.environ.get("LOOP_HOURS", "20"))
    start = datetime.datetime.now(KST)
    return start, start + datetime.timedelta(hours=hours)


START, DEADLINE = _deadline()
STOP_NEW = DEADLINE
PACKAGE_MODE = DEADLINE - datetime.timedelta(minutes=75)

STATE = ROOT / "STATE"
LOGS = STATE / "logs"
HEARTBEAT = STATE / "HEARTBEAT"
FINGERPRINT = STATE / "DRIVER_SHA256"
LOOP_LOG = ROOT / "LOOP_LOG.md"
DONE_FILE = STATE / "ALL_DONE"
PLAN_FILE = STATE / "PLAN.md"
BUILD_FILE = STATE / "BUILD_REPORT.md"
REVIEW_FILE = STATE / "REVIEW.md"
PHASE_FILE = STATE / "PHASE"
ITER_FILE = STATE / "ITER"
TEST_COMMANDS = STATE / "TEST_COMMANDS"

LOGS.mkdir(parents=True, exist_ok=True)

# Live role engines; may fall back mid-run if credits/auth fail repeatedly.
role_engine = {"orchestrator": "kiro", "builder": "codex", "reviewer": "kiro"}
role_auth_fails = {"orchestrator": 0, "builder": 0, "reviewer": 0}
CURRENT = {"iter": 0, "phase": "idle", "pid": os.getpid()}
ansi = re.compile(r"\x1b\[[0-9;?]*[A-Za-z]")
HB_STOP = threading.Event()


def now() -> datetime.datetime:
    return datetime.datetime.now(KST)


def ts() -> str:
    return now().strftime("%Y-%m-%d %H:%M:%S KST")


def log(msg: str) -> None:
    line = f"- `{ts()}` {msg}\n"
    with LOOP_LOG.open("a") as f:
        f.write(line)
    print(ts(), msg, flush=True)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def guard_driver() -> None:
    digest = sha256_file(DRIVER_PATH)
    if FINGERPRINT.exists():
        expected = FINGERPRINT.read_text().strip().split()[0]
        if expected and expected != digest:
            log(
                f"GUARD: {DRIVER_PATH.name} SHA-256 changed "
                f"(expected {expected[:12]}… got {digest[:12]}…). "
                "Another task may have edited the driver. Exiting."
            )
            sys.exit(3)
    else:
        FINGERPRINT.write_text(digest + "\n")
    # Refresh heartbeat path even if checksum is fine.
    CURRENT["phase"] = CURRENT.get("phase") or "idle"


def write_heartbeat() -> None:
    body = (
        f"{ts()}\n"
        f"pid={os.getpid()}\n"
        f"iter={CURRENT.get('iter')}\n"
        f"phase={CURRENT.get('phase')}\n"
        f"deadline={DEADLINE.strftime('%Y-%m-%d %H:%M:%S KST')}\n"
        f"driver={DRIVER_PATH}\n"
        f"engines={role_engine}\n"
    )
    tmp = HEARTBEAT.with_suffix(".tmp")
    tmp.write_text(body)
    tmp.replace(HEARTBEAT)


def heartbeat_loop() -> None:
    while not HB_STOP.wait(60):
        try:
            write_heartbeat()
        except OSError:
            pass


def save_iter_phase(i: int, phase: str) -> None:
    CURRENT["iter"] = i
    CURRENT["phase"] = phase
    ITER_FILE.write_text(str(i) + "\n")
    PHASE_FILE.write_text(phase + "\n")
    write_heartbeat()


def read_resume() -> tuple[int, str]:
    i = 0
    phase = "plan"
    if ITER_FILE.exists():
        try:
            i = int(ITER_FILE.read_text().strip() or "0")
        except ValueError:
            i = 0
    if PHASE_FILE.exists():
        phase = PHASE_FILE.read_text().strip() or "plan"
    if os.environ.get("START_ITER"):
        i = int(os.environ["START_ITER"])
    if os.environ.get("RESUME_REVIEW") == "1":
        phase = "review"
    return i, phase


def kill_tree(proc: subprocess.Popen) -> None:
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except (ProcessLookupError, PermissionError, OSError):
        try:
            proc.terminate()
        except Exception:
            pass
    try:
        proc.wait(timeout=8)
        return
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(proc.pid, signal.SIGKILL)
    except (ProcessLookupError, PermissionError, OSError):
        try:
            proc.kill()
        except Exception:
            pass
    try:
        proc.wait(timeout=5)
    except Exception:
        pass


def looks_like_auth_failure(text: str) -> bool:
    return bool(AUTH_RE.search(text or ""))


def maybe_fallback(role: str, output: str, why: str) -> None:
    if not looks_like_auth_failure(output) and why != "auth":
        return
    role_auth_fails[role] = role_auth_fails.get(role, 0) + 1
    log(f"WARN possible credit/auth problem for {role} ({role_auth_fails[role]} hit(s)): {why}")
    if role_auth_fails[role] < 2:
        return
    current = role_engine[role]
    if current == "kiro":
        role_engine[role] = "codex"
        log(f"FALLBACK: {role} switching from Kiro to Codex {SOL_MODEL} after repeated auth/credit failures")
    elif current == "codex":
        role_engine[role] = "kiro"
        # Builder fallback uses the same Opus model only as a last resort.
        log(f"FALLBACK: {role} switching from Codex to Kiro claude-opus-5.5 after repeated auth/credit failures")


def cmd_for(role: str, prompt: str) -> list[str]:
    engine = role_engine[role]
    if engine == "codex":
        return [
            CODEX, "exec", "-m", SOL_MODEL,
            "-c", "model_reasoning_effort=high",
            "-c", "features.fast_mode=false",
            "-s", "danger-full-access",
            "--skip-git-repo-check",
            "-C", str(ROOT),
            prompt,
        ]
    return [K, "chat", "--no-interactive", "--trust-all-tools", *OPUS_ARGS, prompt]


def call(role: str, prompt: str, tag: str, timeout: int) -> bool:
    guard_driver()
    last_out = ""
    for attempt in range(1, MAX_TRIES + 1):
        t0 = time.time()
        logp = LOGS / f"{tag}_{role}_try{attempt}.log"
        engine = role_engine[role]
        cmd = cmd_for(role, prompt)
        shown = "codex " + SOL_MODEL if engine == "codex" else " ".join(OPUS_ARGS)
        log(f"START {tag} {role} ({engine} {shown}) try {attempt} timeout={timeout}s")
        try:
            proc = subprocess.Popen(
                cmd,
                cwd=str(ROOT),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                stdin=subprocess.DEVNULL,
                text=True,
                start_new_session=True,
            )
            try:
                out, _ = proc.communicate(timeout=timeout)
                rc = proc.returncode
            except subprocess.TimeoutExpired:
                kill_tree(proc)
                out = ""
                try:
                    # communicate again to drain after kill
                    drained, _ = proc.communicate(timeout=5)
                    out = drained or ""
                except Exception:
                    pass
                out = ansi.sub("", out or "")
                logp.write_text(out + f"\n---TIMEOUT after {timeout}s---\n")
                log(f"TIMEOUT {tag} {role} after {timeout}s (killed process group); log={logp.relative_to(ROOT)}")
                if attempt < MAX_TRIES:
                    time.sleep(RETRY_SLEEP)
                    continue
                # Builder may have left useful work; reviewer/orchestrator must not be treated as success.
                return role == "builder"
            out = ansi.sub("", out or "")
            last_out = out
            logp.write_text(out)
            elapsed = int(time.time() - t0)
            log(f"END {tag} {role} rc={rc} {elapsed}s log={logp.relative_to(ROOT)}")
            if rc == 0:
                return True
            if looks_like_auth_failure(out):
                maybe_fallback(role, out, "auth")
        except OSError as exc:
            log(f"ERROR {tag} {role} launch failed: {exc}")
            logp.write_text(str(exc))
        if attempt < MAX_TRIES:
            time.sleep(RETRY_SLEEP)
    log(f"FAIL {tag} {role} after {MAX_TRIES} tries")
    if last_out:
        maybe_fallback(role, last_out, "auth")
    return False


def round_tests(tag: str) -> tuple[bool, str]:
    """Run driver-owned tests. Missing TEST_COMMANDS before an app exists is not a hard fail on iter 1 research-only, but is recorded."""
    if TEST_COMMANDS.is_file():
        commands = [
            line.strip() for line in TEST_COMMANDS.read_text().splitlines()
            if line.strip() and not line.strip().startswith("#")
        ]
    else:
        commands = []
        pkg = ROOT / "package.json"
        if (ROOT / "tests").exists() or list(ROOT.glob("**/test_*.py")):
            commands.append("python3 -m pytest -q")
        if pkg.is_file() and "test" in pkg.read_text():
            commands.append("npm test")
    if not commands:
        msg = "no TEST_COMMANDS yet"
        log(f"{tag} driver tests: {msg}")
        return True, msg  # reviewer still grades DoD; no suite to fail
    env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1", "CI": "1"}
    outcomes = []
    all_ok = True
    for i, command in enumerate(commands, 1):
        path = LOGS / f"{tag}_tests_{i}.txt"
        try:
            with path.open("w") as output:
                output.write(f"$ {command}\n")
                output.flush()
                result = subprocess.run(
                    ["bash", "-lc", command],
                    cwd=str(ROOT),
                    env=env,
                    stdin=subprocess.DEVNULL,
                    stdout=output,
                    stderr=subprocess.STDOUT,
                    timeout=1500,
                )
                output.write(f"\nEXIT={result.returncode}\n")
                code = result.returncode
        except (OSError, subprocess.TimeoutExpired) as exc:
            path.write_text(f"{exc}\nEXIT=1\n")
            code = 1
        ok = code == 0
        all_ok = all_ok and ok
        outcomes.append(f"cmd{i} exit={code} ({path.relative_to(ROOT)})")
    summary = "; ".join(outcomes)
    log(f"{tag} driver tests: {summary}")
    return all_ok, summary


def commit_push(version: str, message: str) -> bool:
    git_env = {
        **os.environ,
        "GIT_TERMINAL_PROMPT": "0",
        "GIT_AUTHOR_NAME": "MadanChaollaPark",
        "GIT_AUTHOR_EMAIL": "164869903+MadanChaollaPark@users.noreply.github.com",
        "GIT_COMMITTER_NAME": "MadanChaollaPark",
        "GIT_COMMITTER_EMAIL": "164869903+MadanChaollaPark@users.noreply.github.com",
    }

    def git(*args, input_data=None):
        return subprocess.run(
            ["git", *args],
            cwd=str(ROOT),
            env=git_env,
            input=input_data,
            capture_output=True,
            timeout=GIT_TIMEOUT,
        )

    def checked(*args, input_data=None):
        result = git(*args, input_data=input_data)
        result.check_returncode()
        return result.stdout

    try:
        branch = checked("symbolic-ref", "--short", "HEAD").strip()
        if branch != b"main":
            log("Publish stopped: expected to be on main")
            return False
        if git("show-ref", "--verify", "--quiet", f"refs/tags/{version}").returncode == 0:
            log(f"Publish stopped: {version} already exists")
            return False
        checked("add", "-A")
        staged = checked("diff", "--cached", "--name-only", "--diff-filter=ACMRT", "-z")
        if staged:
            ignored = git("check-ignore", "--no-index", "--stdin", "-z", input_data=staged)
            if ignored.returncode == 0:
                log("Publish stopped: the index contains ignored paths")
                return False
            if ignored.returncode not in (0, 1):
                ignored.check_returncode()
        checked("commit", "--allow-empty", "-m", message)
        checked("tag", version)
    except subprocess.CalledProcessError as exc:
        err = (exc.stderr or b"").decode(errors="replace").strip()[-400:]
        log(f"git {exc.cmd[1]} rc={exc.returncode} {err}")
        return False
    except subprocess.TimeoutExpired as exc:
        log(f"git {exc.cmd[1]} timed out")
        return False

    for attempt in range(1, 4):
        try:
            result = git("push", "--atomic", "origin", "main", "--tags")
            detail = (result.stderr or b"").decode(errors="replace").strip()[-400:]
            log(f"push rc={result.returncode} {version} (try {attempt}) {detail}")
            if result.returncode == 0:
                return True
        except subprocess.TimeoutExpired:
            log(f"push timeout {version} (try {attempt})")
        if attempt < 3:
            time.sleep(30)
    return False


COMMON = (
    f"Read {ROOT}/GOAL.md first (the shared brief) and {ROOT}/RESEARCH.md. "
    f"You work only in {ROOT}. Do not touch /workspace/garamjigi or /workspace/kumgang. "
    f"{OWNER_REVIEW}. Keep this owner decision intact in GOAL.md and STATE/PLAN.md. "
    "Only the owner may change role assignments or loop configuration. "
    "Leave speedrun_pe_loop.py to the owner. Leave git commits, tags, and pushes to the driver. "
    "Never submit the speedrun Product Engineer form or any other form. "
    "Never email, message, post, or contact anyone. Never sign in to speedrun-talent-network.com. "
    "Never fake results. "
)

REVIEW_PROMPT = (
    "Inspect the working tree, the diff since the previous tag if any, tests, and artifacts "
    "against STATE/PLAN.md and the Definition of Done in GOAL.md. "
    "Check correctness, originality (no visual or code copying of the talent-network site), "
    "UX/keyboard flow, security (XSS on pasted job text, secrets, unsafe links), and whether "
    "claims in BUILD_REPORT.md actually hold. "
    "Run the relevant tests yourself when practical and record exact commands, exit codes, and results. "
    "If a browser run is blocked, use the fresh driver test log and say who ran it. "
    "Write STATE/REVIEW.md with verdict PASS / PARTIAL / FAIL, a grade per Definition of Done item "
    "with evidence, concrete issues (file paths), and a prioritized must-fix list. "
    "Update STATE/CHECKLIST.md statuses only when evidence supports them. "
    "Fix only trivial issues yourself; leave real fixes for the next plan. "
    "Any failed or skipped required test is FAIL. Clean tests with unmet requirements are PARTIAL. "
    "PASS only if the entire Definition of Done is verified this round, including a public live link "
    "that opens without a login. Do not write STATE/ALL_DONE; the driver owns that marker. "
    "Reply in 5 lines."
)


def main() -> None:
    if not LOOP_LOG.exists():
        LOOP_LOG.write_text("# LOOP LOG (KST)\n\n")
    guard_driver()
    # Keep a launch backup that other tasks are less likely to open.
    bak = ROOT / f"speedrun_pe_loop.py.bak.launch-{START.strftime('%Y%m%d-%H%M')}"
    if not bak.exists():
        shutil.copy2(DRIVER_PATH, bak)

    hb = threading.Thread(target=heartbeat_loop, name="heartbeat", daemon=True)
    hb.start()

    i, resume_phase = read_resume()
    skip_plan = skip_build = False
    if i > 0 and resume_phase in {"build", "review", "test", "push"}:
        skip_plan = True
        skip_build = resume_phase in {"review", "test", "push"}
        log(f"RESUME: iteration {i}, starting at phase={resume_phase}")

    log(
        f"DRIVER STARTED pid={os.getpid()}. start={START.strftime('%Y-%m-%d %H:%M:%S')} "
        f"deadline/STOP_NEW={DEADLINE.strftime('%Y-%m-%d %H:%M:%S')} KST "
        f"(20h; finish current round then exit; no new round after STOP_NEW). "
        f"PACKAGE_MODE from {PACKAGE_MODE.strftime('%Y-%m-%d %H:%M:%S')} KST. "
        f"Launch path: {DRIVER_PATH}. "
        "Orchestrator+Reviewer: kiro-cli claude-opus-5.5 (--effort high). "
        "Builder: codex gpt-6.2-sol (reasoning high, fast_mode=false). "
        f"Timeouts: opus {OPUS_TIMEOUT}s, builder {BUILDER_TIMEOUT}s, kill+retry x{MAX_TRIES}. "
        f"Heartbeat: {HEARTBEAT}."
    )

    fails = 0
    write_heartbeat()

    while True:
        guard_driver()
        if not (skip_plan or skip_build):
            if now() >= STOP_NEW:
                log("STOP_NEW reached; not starting a new round.")
                break
            i += 1
        tag = f"iter{i:02d}"
        round_start = now()
        round_note = (
            f"Next-round cutoff is {STOP_NEW:%Y-%m-%d %H:%M:%S} KST. "
            "Finish this round even if the cutoff passes. "
        )
        if round_start >= PACKAGE_MODE or now() >= PACKAGE_MODE:
            round_note += (
                "PACKAGE MODE: finish the live link, tests, APPLICATION_DRAFT.md, "
                "README, and any remaining Definition of Done items. No new features. "
            )
        if not (skip_plan or skip_build):
            log(f"=== ITERATION {i} === {round_note}")

        plan_ready = skip_plan or skip_build
        if not skip_plan:
            save_iter_phase(i, "plan")
            plan = (
                COMMON
                + f"ROLE: ORCHESTRATOR. {round_note}Iteration {i}. "
                "Inspect the current tree, STATE/CHECKLIST.md, the last STATE/REVIEW.md and "
                "STATE/BUILD_REPORT.md if they exist, and the tail of LOOP_LOG.md. "
                "Create/update STATE/CHECKLIST.md (every deliverable and sub-requirement with "
                "status TODO / IN-PROGRESS / VERIFIED + evidence). "
                "Then write STATE/PLAN.md: a concrete, ordered work package for the BUILDER "
                "(a different model that can run shell, write code, and run tests) for roughly "
                "the next 40–70 minutes, with exact acceptance criteria and commands to run. "
                "Early iterations: lock any remaining product details, scaffold the app, implement "
                "the core brief flow with samples, tests, then GitHub Pages, then APPLICATION_DRAFT.md, "
                "then polish. The product idea in GOAL.md is already locked: Worth Your Time. "
                f"Preserve this line verbatim in the new plan: {OWNER_REVIEW}\n"
                "Do not implement the whole app yourself except tiny fixes. "
                "Do not write STATE/ALL_DONE. Keep your final reply to 5 lines."
            )
            prior = PLAN_FILE.stat().st_mtime_ns if PLAN_FILE.is_file() else None
            planned = call("orchestrator", plan, tag + "_plan", timeout=OPUS_TIMEOUT)
            plan_ready = planned and PLAN_FILE.is_file() and PLAN_FILE.stat().st_mtime_ns != prior
            if not plan_ready:
                log(f"{tag} no fresh plan; will still attempt a build or review existing artifacts")
                fails += 1
            elif OWNER_REVIEW not in PLAN_FILE.read_text().splitlines():
                with PLAN_FILE.open("a") as fh:
                    fh.write(f"\n{OWNER_REVIEW}\n")

        if not skip_build:
            save_iter_phase(i, "build")
            build = (
                COMMON
                + f"ROLE: BUILDER/OPERATOR. {round_note}Read STATE/PLAN.md and execute it fully. "
                "Do the research, coding, testing, and (if planned) GitHub Pages deploy yourself "
                "with real commands. Fix failures until the acceptance criteria pass or you are blocked. "
                "Write or update STATE/TEST_COMMANDS with one shell command per line so the driver "
                "can re-run tests. Never fake results. When done (or if blocked), write "
                "STATE/BUILD_REPORT.md with: what you did, files created/changed, exact commands "
                "run and their real outcomes (pass/fail counts), the live URL if any, and anything "
                "unfinished or uncertain. Keep long-running servers out of the foreground "
                "(background + cleanup). Reply in 5 lines."
            )
            if not call("builder", build, tag + "_build", timeout=BUILDER_TIMEOUT):
                fails += 1

        skip_plan = skip_build = False
        save_iter_phase(i, "test")
        tests_ok, test_summary = round_tests(tag)

        save_iter_phase(i, "review")
        rev = (
            COMMON
            + f"ROLE: REVIEWER. {round_note}Iteration {i}. Read STATE/BUILD_REPORT.md. "
            + REVIEW_PROMPT
            + f" Fresh driver test results: {test_summary}. tests_ok={tests_ok}."
        )
        reviewed = call("reviewer", rev, tag + "_review", timeout=OPUS_TIMEOUT)
        if not reviewed:
            fails += 1

        verdict = "FAIL"
        if REVIEW_FILE.is_file():
            text = REVIEW_FILE.read_text()
            m = re.search(r"\bVERDICT:\s*(PASS|PARTIAL|FAIL)\b", text, re.I)
            if not m:
                m = re.search(r"\b(?:verdict|Verdict)\b[:\s]*\**\s*(PASS|PARTIAL|FAIL)\b", text)
            if m:
                verdict = m.group(1).upper()
        if not tests_ok and verdict == "PASS":
            verdict = "FAIL"
            log(f"{tag} driver overrode reviewer PASS → FAIL because tests failed")
        log(f"{tag} verdict: {verdict}")

        save_iter_phase(i, "push")
        if not commit_push(f"v{i:02d}-iter{i:02d}", f"iter{i:02d}: {verdict}"):
            log("Round publication failed. Driver stopping.")
            break

        if verdict == "PASS" and tests_ok:
            DONE_FILE.write_text(
                f"PASS recorded for {tag} at {ts()}. Loop continues polishing until STOP_NEW.\n"
            )
            log(f"{tag} PASS recorded. Continuing to polish until the cutoff unless package mode says stop.")

        if fails >= STOP_AFTER_FAILED_CALLS:
            log(f"Too many failed model calls (>={STOP_AFTER_FAILED_CALLS}). Driver stopping.")
            break

        # Ready for a new round on the next loop (time check happens at the top).
        save_iter_phase(i, "done")

    log(f"DRIVER ENDED at {ts()}; iterations={i}; failed_calls={fails}")
    CURRENT["phase"] = "ended"
    write_heartbeat()
    HB_STOP.set()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        log(f"DRIVER CRASH: {type(exc).__name__}: {exc}")
        raise
