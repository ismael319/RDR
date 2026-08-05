import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SCRIPTS = [
  'src/loaders.js',
  'src/supabase-config.js',
  'src/logos.js',
  'src/constants.js',
  'src/mappers.js',
  'src/sync.js',
  'src/db.js',
  'src/apr-db.js',
  'src/pdf.js',
  'src/pdf-dashboard.js',
  'src/docx-apr.js',
  'src/docx-cert.js',
  'src/icons.js',
  'src/ui.js',
  'src/screens/Login.js',
  'src/screens/Home.js',
  'src/screens/CampoHub.js',
  'src/screens/Registros.js',
  'src/screens/Dashboard.js',
  'src/screens/Gestor.js',
  'src/screens/Form.js',
  'src/screens/Apr.js',
  'src/screens/Certificados.js',
  'src/offline.js',
  'src/screens/App.js',
];

const head = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <meta name="theme-color" content="#000000"/>
  <meta name="mobile-web-app-capable" content="yes"/>
  <meta name="apple-mobile-web-app-capable" content="yes"/>
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
  <meta name="apple-mobile-web-app-title" content="RDR BDR"/>
  <link rel="manifest" href="./manifest.webmanifest"/>
  <link rel="icon" href="./icon.png" type="image/png"/>
  <title>RDR — BDR Segurança</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
            <!-- Supabase -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap" rel="preload" as="style" onload="this.rel='stylesheet'"/>
  <noscript><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap" rel="stylesheet"/></noscript>
  <style>
`;

const body = `  </style>
</head>
<body>
<div id="root"><div class="loading-screen" id="loading-screen"><div class="loading-spinner"></div><div class="loading-text">CARREGANDO</div></div></div>

<script>
`;

const tail = `</script>
</body>
</html>
`;

let js = '';
for (const file of SCRIPTS) {
  const content = readFileSync(file, 'utf8').replace(/\n$/, '');
  js += content + '\n';
}

const css = readFileSync('src/style.css', 'utf8').replace(/\n$/, '');

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', head + css + body + js + tail, 'utf8');
console.log('Build gerado: dist/index.html (' + Math.round((head.length + css.length + body.length + js.length + tail.length) / 1024) + ' KB)');

// ── PWA: ícone, manifest e service worker ──
const logosSrc = readFileSync('src/logos.js', 'utf8');
const m = logosSrc.match(/window\.__LOGO_SRC__="data:image\/png;base64,([^"]+)"/);
if (m && m[1]) {
  writeFileSync('dist/icon.png', Buffer.from(m[1], 'base64'));
  console.log('Gerado: dist/icon.png');
} else {
  console.warn('Aviso: não foi possível extrair o logo para dist/icon.png');
}

const manifest = {
  name: 'RDR — BDR Segurança',
  short_name: 'RDR',
  description: 'Registro Diário de Risco — Segurança do Trabalho',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#000000',
  theme_color: '#000000',
  icons: [
    { src: './icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: './icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
};
writeFileSync('dist/manifest.webmanifest', JSON.stringify(manifest, null, 2));
console.log('Gerado: dist/manifest.webmanifest');

const SW = `// Service Worker RDR — incremente CACHE_V a cada deploy
var CACHE_V = 'rdr-cache-v1';
var PRECACHE = ['./', './index.html', './manifest.webmanifest', './icon.png'];
var CDN_HOSTS = ['unpkg.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_V)
      .then(function(c) { return c.addAll(PRECACHE); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(keys.filter(function(k) { return k !== CACHE_V; }).map(function(k) { return caches.delete(k); }));
      })
      .then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then(function(c) { return c || fetch(req); }));
    return;
  }
  if (url.origin !== self.location.origin) {
    if (CDN_HOSTS.indexOf(url.hostname) === -1) return;
    e.respondWith(caches.match(req).then(function(c) {
      return c || fetch(req).then(function(res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE_V).then(function(c2) { c2.put(req, copy); });
        }
        return res;
      });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function(c) {
    return c || fetch(req).then(function(res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE_V).then(function(c2) { c2.put(req, copy); });
      }
      return res;
    });
  }));
});
`;
writeFileSync('dist/sw.js', SW);
console.log('Gerado: dist/sw.js');
