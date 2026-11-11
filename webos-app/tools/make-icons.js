// Builds the app icons from media/logo-source.jpeg. Usage: node webos-app/tools/make-icons.js (or npm run icons)
// Writes webos-app/icon.png (80), webos-app/largeIcon.png (130) and media/icon-512.png (Homebrew Channel listing).
// Uses macOS `sips`, or ImageMagick (`magick` / `convert`) elsewhere.
var cp = require('child_process'), path = require('path');
var root = path.join(__dirname, '..', '..'), src = path.join(root, 'media', 'logo-source.jpeg');
var out = [[path.join(root, 'webos-app', 'icon.png'), 80], [path.join(root, 'webos-app', 'largeIcon.png'), 130], [path.join(root, 'media', 'icon-512.png'), 512]];
function has(cmd) { try { cp.execFileSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' }); return true; } catch (e) { return false; } }
var im = has('magick') ? 'magick' : has('convert') ? 'convert' : null;
if (!has('sips') && !im) { console.error('Needs macOS sips or ImageMagick.'); process.exit(1); }
out.forEach(function (o) {
  if (has('sips')) cp.execFileSync('sips', ['-s', 'format', 'png', '-z', String(o[1]), String(o[1]), src, '--out', o[0]], { stdio: 'ignore' });
  else cp.execFileSync(im, [src, '-resize', o[1] + 'x' + o[1] + '!', o[0]]);
  console.log('wrote ' + path.relative(root, o[0]) + ' (' + o[1] + 'px)');
});
