import { readFileSync } from 'node:fs';

const ORIGINAL = 'index.backup.html';
const lines = readFileSync(ORIGINAL, 'utf8').split(/\r?\n/);

const FILES = [
  ['src/loaders.js', 71, 99],
  ['src/supabase-config.js', 106, 109],
  ['src/logos.js', 112, 113],
  ['src/constants.js', 115, 145],
  ['src/mappers.js', 147, 171],
  ['src/db.js', 173, 284],
  ['src/apr-db.js', 286, 459],
  ['src/pdf.js', 461, 667],
  ['src/pdf-dashboard.js', 668, 888],
  ['src/docx-apr.js', 889, 1297],
  ['src/icons.js', 1299, 1898],
  ['src/ui.js', 1899, 2085],
  ['src/screens/Login.js', 2087, 2248],
  ['src/screens/Home.js', 2249, 2641],
  ['src/screens/CampoHub.js', 2642, 2960],
  ['src/screens/Registros.js', 2961, 3644],
  ['src/screens/Dashboard.js', 3646, 4641],
  ['src/screens/Gestor.js', 4643, 5288],
  ['src/screens/Form.js', 5290, 6017],
  ['src/screens/Apr.js', 6018, 8492],
  ['src/screens/App.js', 8495, 8596],
];

let falhas = 0;
for (const [file, start, end] of FILES) {
  const expected = lines.slice(start - 1, end);
  while (expected.length && expected[0].trim() === '') expected.shift();
  while (expected.length && expected[expected.length - 1].trim() === '') expected.pop();
  let expectedText = expected.join('\n');
  if (file === 'src/logos.js') {
    expectedText = expectedText.replace(/<script>/g, '').replace(/<\/script>/g, '');
  }
  const atual = readFileSync(file, 'utf8').replace(/\n$/, '');
  if (atual === expectedText) {
    console.log(`OK  ${file}`);
  } else {
    falhas++;
    console.log(`FALHA ${file}`);
  }
}

const css = lines.slice(17, 67);
while (css.length && css[0].trim() === '') css.shift();
while (css.length && css[css.length - 1].trim() === '') css.pop();
const cssAtual = readFileSync('src/style.css', 'utf8').replace(/\n$/, '');
if (cssAtual === css.join('\n')) {
  console.log('OK  src/style.css');
} else {
  falhas++;
  console.log('FALHA src/style.css');
}

if (falhas) {
  console.log(`\n${falhas} arquivo(s) DIFERENTES do original.`);
  process.exit(1);
} else {
  console.log('\nTodos os arquivos são 100% idênticos ao original. Nada foi alterado.');
}
