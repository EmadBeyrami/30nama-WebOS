/* LG webOS integration: detection, exit, Magic Remote pointer state, app visibility. */
(function () {
  var ua = navigator.userAgent || '';
  var P = N.platform = {
    // webOS 22+ exposes webOSSystem, older releases PalmSystem; the UA says "Web0S" on all of them
    webos: !!(window.webOSSystem || window.PalmSystem || /Web0S|webOS/i.test(ua)),
    cursor: false // Magic Remote pointer currently shown
  };

  function sys() { return window.webOSSystem || window.PalmSystem || null; }

  P.exit = function () {
    // window.close() quits a webOS web app; platformBack() is the fallback that returns to the launcher
    try { window.close(); } catch (e) {}
    setTimeout(function () {
      var s = sys();
      try { if (s && s.platformBack) { s.platformBack(); return; } } catch (e) {}
      N.toast('Exit (not on webOS)');
    }, 150);
  };

  // Magic Remote: while the pointer is shown, OK produces a click on the pointed element as well as an Enter keydown.
  // nav.js skips that Enter so an item is never activated twice.
  document.addEventListener('cursorStateChange', function (e) {
    P.cursor = !!(e && e.detail && e.detail.visibility);
    document.body.classList.toggle('pointer', P.cursor);
  }, false);

  // Home button / app switch: pause playback while the app is in the background.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && N.player && N.player.open && !N.player.paused) {
      try { N.player.togglePause(); } catch (e) {}
    }
  }, false);
})();
