// Writes the webOS Homebrew Channel manifest for a built .ipk.
// Usage: node tools/manifest.js <ipk> <owner/repo> > dist/30nama.manifest.json
var fs = require('fs'), path = require('path'), crypto = require('crypto');
var ipk = process.argv[2], repo = process.argv[3];
if (!ipk || !repo) { console.error('usage: node tools/manifest.js <ipk> <owner/repo>'); process.exit(1); }
var app = require(path.join(__dirname, '..', 'webos-app', 'appinfo.json'));
var sha = crypto.createHash('sha256').update(fs.readFileSync(ipk)).digest('hex');
process.stdout.write(JSON.stringify({
  id: app.id,
  version: app.version,
  type: 'web',
  title: app.title,
  appDescription: 'Unofficial, unaffiliated open-source TV interface for 30nama. Hosts no content. See DISCLAIMER.md.',
  iconUri: 'https://raw.githubusercontent.com/' + repo + '/main/media/icon-512.png',
  sourceUrl: 'https://github.com/' + repo,
  rootRequired: false,
  ipkUrl: path.basename(ipk), // relative to the manifest URL (both are assets of the same release)
  ipkHash: { sha256: sha }
}, null, 2) + '\n');
