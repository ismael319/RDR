// ── Camada offline: cache local (IndexedDB) e fila de operações pendentes ──
var _rdrCache = {
  db: null,
  versao: 1
};
function abrirCacheLocal() {
  if (_rdrCache.db) return _rdrCache.db;
  _rdrCache.db = new Promise(function(resolve, reject) {
    if (!window.indexedDB) { reject(new Error('IndexedDB indisponível')); return; }
    var req = indexedDB.open('rdr-cache', _rdrCache.versao);
    req.onupgradeneeded = function() {
      var db = req.result;
      if (!db.objectStoreNames.contains('records')) db.createObjectStore('records', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('ops')) db.createObjectStore('ops', { keyPath: 'ts' });
    };
    req.onsuccess = function() { resolve(req.result); };
    req.onerror = function() { reject(req.error); };
  });
  return _rdrCache.db;
}
function txCache(loja, modo, fn) {
  return abrirCacheLocal().then(function(db) {
    return new Promise(function(resolve, reject) {
      var resultado;
      var tx = db.transaction(loja, modo);
      var store = tx.objectStore(loja);
      var req = fn(store);
      if (req) req.onsuccess = function() { resultado = req.result; };
      tx.oncomplete = function() { resolve(resultado); };
      tx.onerror = function() { reject(tx.error); };
      tx.onabort = function() { reject(tx.error); };
    });
  });
}
async function cacheRecords(registros) {
  try {
    await txCache('records', 'readwrite', function(s) {
      (registros || []).forEach(function(r) {
        if (r && r.id) s.put(r);
      });
    });
  } catch (e) {}
}
async function getCachedRecords() {
  try {
    return await txCache('records', 'readonly', function(s) { return s.getAll(); });
  } catch (e) { return []; }
}
async function removerCached(id) {
  if (!id) return;
  try {
    await txCache('records', 'readwrite', function(s) { s.delete(id); });
  } catch (e) {}
}
async function enqueueOp(op) {
  try {
    await txCache('ops', 'readwrite', function(s) {
      s.put({ op: op.op, rec: op.rec || null, ts: op.ts || Date.now() });
    });
  } catch (e) {}
}
async function getPendingOps() {
  try {
    return await txCache('ops', 'readonly', function(s) { return s.getAll(); });
  } catch (e) { return []; }
}
async function removeOp(ts) {
  if (!ts) return;
  try {
    await txCache('ops', 'readwrite', function(s) { s.delete(ts); });
  } catch (e) {}
}
function quandoOnline(fn) {
  if (navigator.onLine) { fn(); return; }
  window.addEventListener('online', function handler() {
    window.removeEventListener('online', handler);
    fn();
  });
}
