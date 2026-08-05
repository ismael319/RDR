// ── PWA: registro do Service Worker e reação a mudanças de conexão ──
(function() {
  var emProducao = !!document.querySelector('link[rel="manifest"]');
  var protocoloOk = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (emProducao && protocoloOk && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function() {});
  }
  window.addEventListener('online', function() {
    if (window.fsdb && fsdb.sincronizar) fsdb.sincronizar();
  });
})();
