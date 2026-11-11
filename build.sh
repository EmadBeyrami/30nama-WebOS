#!/usr/bin/env bash
# Build the webOS .ipk. Installation happens ONLY when an explicit device is given.
# Usage: ./build.sh [<ares-device-name>]
#   Needs the webOS CLI: `npm install` in this folder (uses ./node_modules/.bin) or `npm i -g @webos-tools/cli`.
#   Register the TV once with `ares-setup-device` (Developer Mode app on the TV shows IP + passphrase).
set -euo pipefail
DEVICE="${1:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATH="$ROOT/node_modules/.bin:$PATH"
if ! command -v ares-package >/dev/null 2>&1; then
  echo 'webOS CLI missing. Run `npm install` here, or `npm install -g @webos-tools/cli`.' >&2
  exit 1
fi
APP_ID="$(node -p "require('$ROOT/webos-app/appinfo.json').id")"
rm -rf "$ROOT/build"
mkdir -p "$ROOT/build" "$ROOT/dist"
cp -R "$ROOT/webos-app" "$ROOT/build/web"
rm -rf "$ROOT/build/web/tools" "$ROOT/build/web/README.md" "$ROOT/build/web/js/dev-session.js" \
       "$ROOT/build/web/js/dev-session.example.js" "$ROOT/build/web/js/tmdb-token.example.js"
if [[ ! -f "$ROOT/build/web/js/tmdb-token.js" ]]; then
  printf '%s\n' '/* Optional TMDB integration is disabled. */' > "$ROOT/build/web/js/tmdb-token.js"
fi
printf '%s\n' '/* no dev session in packaged builds */' > "$ROOT/build/web/js/dev-session.js"
ares-package --no-minify "$ROOT/build/web" -o "$ROOT/dist"
IPK=$(ls -t "$ROOT"/dist/*.ipk | head -1)
echo "Package: $IPK"
if [[ -n "$DEVICE" ]]; then
  ares-install -d "$DEVICE" "$IPK"
  ares-launch -d "$DEVICE" "$APP_ID"
fi
