import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const lines = readFileSync('index.backup.html', 'utf8').split(/\r?\n/);

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

for (const [file, start, end] of FILES) {
  const slice = lines.slice(start - 1, end);
  while (slice.length && slice[0].trim() === '') slice.shift();
  while (slice.length && slice[slice.length - 1].trim() === '') slice.pop();
  let content = slice.join('\n');
  if (file === 'src/logos.js') {
    content = content.replace(/<script>/g, '').replace(/<\/script>/g, '');
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content + '\n', 'utf8');
  console.log(`OK ${file} (${end - start + 1} linhas)`);
}

const css = lines.slice(17, 67);
while (css.length && css[0].trim() === '') css.shift();
while (css.length && css[css.length - 1].trim() === '') css.pop();
mkdirSync('src', { recursive: true });
writeFileSync('src/style.css', css.join('\n') + '\n', 'utf8');
console.log('OK src/style.css');
