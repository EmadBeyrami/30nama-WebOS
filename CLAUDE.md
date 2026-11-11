# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Unofficial 30nama.com client for LG webOS TVs, ported from the Tizen app at github.com/msharifi99/30nama-tizenos (UI and features are kept in sync with it). A plain HTML/CSS/JS web app (no bundler, no runtime npm deps, no linter) at 1920x1080, driven by the remote D-pad and the Magic Remote pointer. It ships as an `.ipk` (built with `@webos-tools/cli`, released by `.github/workflows/release.yml` together with a Homebrew Channel manifest).

## Commands

- Run in a desktop browser: `npm run dev` (= `node webos-app/tools/devserver.js 8080`), then open http://localhost:8080/. Arrow keys/Enter/Backspace or Escape (= Back) work; the QR screen has a Guest button.
- Build: `./build.sh` writes `dist/<id>_<version>_all.ipk`; `./build.sh <ares-device>` also installs and launches. Needs `npm install` first (local ares-cli). Register a TV with `npx ares-setup-device`.
- UI regression test: `npm install --no-save playwright && npm run test:ui` (uses local Chrome; `COMPAT85=1` strips CSS absent from Chromium 85).
- Regenerate icons: `npm run icons`. Homebrew manifest: `node tools/manifest.js <ipk> <owner/repo>`.

## Architecture

All code is global-namespace `N` (`window.N`), loaded by ordered `<script>` tags in `webos-app/index.html`; load order matters (config → platform → i18n → tmdb-token → api → tmdb → nav → stage → ui → logo → direct → player → screens → app). No modules. ES5 only.

- `config.js`: constants, API keys, webOS key codes (Back 461), `N.store` (localStorage), DOM helpers. The dev proxy is used only on localhost over http (never under `file://` on the TV).
- `platform.js`: webOS detection (`webOSSystem`/`PalmSystem`/UA), `N.platform.exit()`, Magic Remote pointer state (`cursorStateChange` → `N.platform.cursor`, `body.pointer`), pause on `visibilitychange`.
- `nav.js`: custom spatial navigation (`onnav`, `onfocus2`, `reveal`, scopes, `body.fast`). While the pointer is visible, Enter keydowns are ignored because webOS also delivers a click on the pointed element; every focusable therefore needs `onclick` (not only `onenter`).
- `player.js`: `nativeBackend` (`<video src>` through the webOS media pipeline; HLS and direct mkv/mp4; `video.audioTracks`) on webOS, `videoBackend` (hls.js) elsewhere. A native HLS error retries once with hls.js at the same position (`P.useHls`). Direct download files are only offered on webOS.
- `screens.js`, `app.js`, `stage.js`, `ui.js`, `tmdb.js`, `api.js`, `direct.js`: same roles as in the Tizen app.
- `tools/devserver.js`: static server plus `/proxy?url=` (CORS, m3u8 rewrite). Uses Node's `https`, not `fetch` (Cloudflare blocks undici's TLS fingerprint). `build.sh` strips `webos-app/tools/` and the example/dev files from the package.

## Constraints and conventions

- Target is webOS 22+ (Chromium 87) with the CSS kept to the Chromium 85 feature set: no CSS nesting, `:has`, container queries, or `backdrop-filter`. Only `transform`/`opacity` are animated (`design/DESIGN.md`).
- Persian (RTL) is first-class: logical CSS properties and `--dir`; no letter-spacing on Persian; all strings go through `i18n.js` (en/fa).
- Marquee rule from the Tizen app applies: truncated text on/next to a focusable must use `ui.mq`/`el._mq`/`ui.mqText`.
- Back handling is layered (player → sheets → content → rail → exit confirm). `appinfo.json` sets `disableBackHistoryAPI` so Back arrives as keyCode 461.
- Never commit or bundle a TMDB token; the release workflow fails on JWT-like strings in the ipk.
- Version lives in both root `package.json` and `webos-app/appinfo.json`; the release workflow bumps both.
