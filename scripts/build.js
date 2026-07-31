import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SCRIPTS = [
  'src/loaders.js',
  'src/supabase-config.js',
  'src/logos.js',
  'src/constants.js',
  'src/mappers.js',
  'src/db.js',
  'src/apr-db.js',
  'src/pdf.js',
  'src/pdf-dashboard.js',
  'src/docx-apr.js',
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
  'src/screens/App.js',
];

const head = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <meta name="theme-color" content="#000000"/>
  <meta name="apple-mobile-web-app-capable" content="yes"/>
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
  <meta name="apple-mobile-web-app-title" content="RDR BDR"/>
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
