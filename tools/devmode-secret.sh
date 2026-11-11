#!/usr/bin/env bash
# Reads the Developer Mode session token from the TV and stores it as the WEBOS_DEVMODE_TOKEN
# secret of this GitHub repo, for .github/workflows/devmode-renew.yml. The token is never printed.
# Usage: tools/devmode-secret.sh [<ares-device-name>]   (default: tv). Needs `gh auth login`.
set -euo pipefail
DEVICE="${1:-tv}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PATH="$ROOT/node_modules/.bin:$PATH"
TOKEN="$(ares-novacom -d "$DEVICE" --run 'cat /var/luna/preferences/devmode_enabled' 2>/dev/null | grep -v '^\[Info\]' | tr -d '\r\n ')"
if [[ ! "$TOKEN" =~ ^[A-Za-z0-9]{16,}$ ]]; then echo "Could not read the Dev Mode token from '$DEVICE' (is Dev Mode on?)." >&2; exit 1; fi
R="$(curl -fsS --max-time 30 "https://developer.lge.com/secure/CheckDevModeSession.dev?sessionToken=$TOKEN")"
grep -q '"result":"success"' <<<"$R" || { echo "LG rejected the token: $R" >&2; exit 1; }
printf '%s' "$TOKEN" | gh secret set WEBOS_DEVMODE_TOKEN
echo "WEBOS_DEVMODE_TOKEN saved. Session time left (h:m:s): $(sed -n 's/.*"errorMsg":"\([^"]*\)".*/\1/p' <<<"$R")"
