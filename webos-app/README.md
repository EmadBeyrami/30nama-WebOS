# 30nama for LG webOS TV (unofficial)

Plain HTML/CSS/JS web app (no build step). Base resolution 1920x1080.

## Structure
- `appinfo.json`, `icon.png` (80), `largeIcon.png` (130): webOS app manifest and icons built from `media/logo-source.jpeg` (`npm run icons` regenerates them, plus `media/icon-512.png`).
- `index.html`: shell (global `#stage` backdrop, icon `#rail`, `#content`, player layer, splash, SVG icon sprite).
- `css/app.css`: "One Stage" design (tokens, fonts, focus rings, motion; only transform/opacity are animated; RTL via logical properties and `--dir`). Spec: `design/DESIGN.md`.
- `fonts/`: bundled Vazirmatn woff2 (Regular/Medium/Bold/ExtraBold + Farsi-digit `FD` variants, SIL OFL 1.1).
- `js/config.js`: constants, API keys (WEBTV verified, ANDROIDTV fallback), key codes, storage and DOM helpers, toast.
- `js/platform.js`: webOS detection, exit, Magic Remote pointer state (`cursorStateChange`), pause on app hide.
- `js/i18n.js`: en/fa strings, `N.setLang` (sets `lang`/`dir`).
- `js/api.js`: endpoint discovery with fallback hosts, `test` probing, `N.api.get/call`, session (`localStorage`).
- `js/nav.js`: spatial navigation with per-element `onnav(dir)` overrides, `onfocus2` focus hook, container `reveal`, scopes, key-repeat "fast" mode (`body.fast`), Magic Remote handling (Enter ignored while the pointer is shown; the pointer's click activates).
- `js/stage.js`: persistent backdrop (two layers, decode-then-crossfade, Ken Burns, poster-bleed fallback).
- `js/ui.js`: icons, card factory (poster/land/top/grid/tile), meta line, start-anchored tracks, vertical scroll helper, episode tiles.
- `js/player.js`: native webOS backend (`<video src>` for HLS and direct mkv/mp4, `video.audioTracks`) on webOS, `<video>` + hls.js elsewhere and as the fallback when native HLS fails; WebVTT overlay (en/fa/off, size from settings), resume, scrubber with seek bubble, skip intro/recap pill, Up Next card with autoplay countdown, audio/subtitle sheet (Up), episodes sheet (Down), observer heartbeat (10 s).
- `js/screens.js`: QR login, Home (billboard + rows + Top 10 + continue watching), Details (+ seasons/episodes sheet and Watchlist/Favorite toggles), Search (on-screen keyboard), Archive (genres + paged grid + sort), My list (Watchlist/Favorites), Settings (two panes).
- `js/app.js`: boot, router with page transitions, icon rail (expands on focus), exit/sign-out confirm sheets, splash, Back handling (content -> rail -> exit confirm).
- `js/lib/`: `qrcode.js` (qrcode-generator 1.4.4), `hls.min.js` (hls.js 1.5.17), both bundled locally.
- `tools/devserver.js`: static server plus `/proxy?url=` (adds CORS, rewrites m3u8 URIs). The app routes all requests through it only when served from localhost over http (never under `file://` on the TV).

## Test in a desktop browser
    node tools/devserver.js 8080
    open http://localhost:8080/
Window is scaled to fit. Arrow keys / Enter / Backspace or Escape (= Back) work. `N.platform.webos = true` in the console switches the player to the native backend (desktop Chrome cannot play HLS natively, so it then exercises the hls.js fallback). Guest button on the QR screen shows Home. Streaming requires a logged-in subscription, so scan the QR with the phone logged in to 30nama.com. Console helper: `N.player.start(post, items, 0)` with any m3u8 to exercise the player.

## Run on a TV
Enable Developer Mode on the TV (Developer Mode app from the LG Content Store), register it once with `npx ares-setup-device`, then from the repo root run `./build.sh <device-name>` (package, install, launch). Debug with `npx ares-inspect -d <device-name> com.nama30.webos --open` (Chrome DevTools against the TV).

## Known unknowns
- Verified on a 2025 LG OLED (webOS 10.3, Chromium 120): boots from `file://`, calls the API directly (the API allows any origin and the `c-*` headers), sign-in and playback work. Also covered by the offline UI regression test (en/fa).
- Older webOS releases are untested; audio-track switching and direct-file playback should be rechecked there. DTS/TrueHD files are skipped by filename (LG 2020+ TVs have no DTS decoder) since webOS does not expose audio codecs to web apps.
- Logged-in payload shapes (stream, user, continue_watching, subtitle values) are handled defensively, as in the Tizen app.

## TMDB enrichment (optional)
`js/tmdb.js` adds TMDB data on top of 30nama. It is fully off when no token is configured (Home/Details behave as before).
- Token: `N.config.tmdbToken` (kept empty in `js/config.js`), set in `js/tmdb-token.js` (loaded after config.js), or `localStorage.tmdbToken` (override, written by Settings > TMDB metadata after TMDB accepts it). Either a v3 "API Key" (32 hex, sent as `api_key`) or a v4 "API Read Access Token" (Bearer). TMDB supports CORS, the dev proxy is not used.
- Mock mode: `localStorage.tmdbMock = '1'` serves `tools/fixtures/*.json` (regenerate with `node tools/make-fixtures.js <token>`). 30nama itself is still called live.
- 30nama -> TMDB: IMDb id from `score.imdb.link` -> `/find`, else `/search/movie|tv` (with year, then without), best normalized-title match. TMDB -> 30nama: `search` action, title similarity + year (+-1) + movie/series kind, streamable preferred, coming-soon skipped. Resolutions run through a 4-wide pool with start spacing and back-off (30nama is behind Cloudflare rate limiting). Caches: memory LRU + localStorage `n30.tc.*` (details 7 d, trending lists 6 h, 30nama resolutions 7 d, misses 1 d); Settings > TMDB metadata has "Clear metadata cache".
- UI: Home rows Trending this week / New & returning series / Popular movies now (rows with <5 resolvable items are omitted; hero billboard uses trending with backdrops + title logos when >=3 resolve). Details: logo, tagline, TMDB rating, next-episode badge, Cast, Crew, Reviews (OK opens a sheet), More like this (only titles found on 30nama).
