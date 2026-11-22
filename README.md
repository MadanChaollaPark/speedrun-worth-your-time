# Worth Your Time

Worth Your Time is a free browser tool for deciding whether a job posting is worth an application or a first call. Paste a posting, open a fictional sample, or use a speedrun job link to get a plain-language brief, a checklist with evidence, and questions to ask. Founders can draft, preview, and export an honest first-hire brief.

[Live demo on GitHub Pages](https://madanchaollapark.github.io/speedrun-worth-your-time/)

## Run locally

Use Node.js 24 and npm.

```sh
npm install
npm run serve
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). Stop the local server with Ctrl+C. The app is served as-is from `docs/`.

## Test

Install Chromium if the Playwright browser is missing.

```sh
npx playwright install chromium
```

Run these from the repository root. Playwright starts and cleans up its own server when port 4173 is free.

```sh
npm run test:unit
npx playwright test
```

The two commands are also in [STATE/TEST_COMMANDS](STATE/TEST_COMMANDS). The browser suite tests keyboard, clipboard, exports, and jobs API behavior with fixtures. It runs axe in light and dark modes and writes six full-page PNGs to [tests/screenshots](tests/screenshots/).

**Live check** (optional, requires network). Run `npm run test:live` to check the deployed GitHub Pages app and save three screenshots. It runs separately from the driver suite.

## Deploy

In GitHub Pages settings, select **Deploy from a branch**, then `main` and `/docs`. The driver publishes the files to `main`. GitHub Pages serves the static files directly and `docs/.nojekyll` keeps that directory as-is.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| Tab to **Skip to content** and press Enter | Focus the main content |
| Enter in the job link field | Check the job link |
| Ctrl+Enter or Cmd+Enter in the posting field | Check the pasted text |
| ? outside an input field | Open keyboard shortcuts |
| Esc in the shortcuts dialog | Close it and restore focus |

## Privacy and scope

The analysis and founder editor run in your browser. Only supported speedrun board job links call the public, no-auth jobs API. The latest pasted text and founder draft are stored on the current device. A pasted-text share link contains an encoded copy of the original posting, readable by anyone who receives the link.

V1 covers one posting at a time and a shareable first-hire template. The scope excludes accounts, LLMs, external-site scraping, résumé matching, and a job search index. The score evaluates what the posting discloses. It leaves personal fit and verification to the reader.

See the [product write-up](PRODUCT.md) for scoring and [research](RESEARCH.md) for application context and public API evidence.

## License

Source in this repo is original work for the portfolio piece. Research screenshots under `research/screenshots/` are captures of public web pages, kept as evidence, not as product assets.
