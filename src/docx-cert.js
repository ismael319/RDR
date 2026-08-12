// ── CERTIFICADOS: motor de geração .docx a partir de modelo com campos MERGEFIELD ──
var _rPrRe = /<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/;
var _campoFldSimpleRe = /<w:fldSimple\b([^>]*\binstr="[^"]*MERGEFIELD\s+([A-Za-z0-9_]+)[^"]*")[^>]*>([\s\S]*?)<\/w:fldSimple>/g;
var _campoCompletoRe = /<w:r\b[^>]*><w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr><w:fldChar w:fldCharType="begin"\/><\/w:r>[\s\S]*?<w:r\b[^>]*><w:rPr\b[^>]*>[\s\S]*?<\/w:rPr><w:instrText\b[^>]*>\s*MERGEFIELD\s+([A-Za-z0-9_]+)\s*<\/w:instrText><\/w:r>[\s\S]*?<w:r\b[^>]*><w:rPr\b[^>]*>[\s\S]*?<\/w:rPr><w:fldChar w:fldCharType="end"\/><\/w:r>/g;
var _campoScanRe = /MERGEFIELD\s+([A-Za-z0-9_]+)/g;

function escapaXml(texto) {
  return String(texto == null ? '' : texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function preencherXmlDocumento(xml, valores) {
  function valorPara(campo) {
    var v = valores[campo];
    return v == null ? '' : String(v);
  }
  xml = xml.replace(_campoFldSimpleRe, function(m, attrs, campo, corpo) {
    var rpr = '';
    var rm = corpo.match(_rPrRe);
    if (rm) rpr = rm[1];
    return '<w:r><w:rPr>' + rpr + '</w:rPr><w:t xml:space="preserve">' + escapaXml(valorPara(campo)) + '</w:t></w:r>';
  });
  xml = xml.replace(_campoCompletoRe, function(m, rpr, campo) {
    return '<w:r><w:rPr>' + rpr + '</w:rPr><w:t xml:space="preserve">' + escapaXml(valorPara(campo)) + '</w:t></w:r>';
  });
  return xml;
}

async function limparMalaDireta(zip) {
  var fSettings = zip.file('word/settings.xml');
  if (fSettings) {
    var s = await fSettings.async('string');
    if (/<w:mailMerge[\s\S]*?<\/w:mailMerge>/.test(s)) {
      zip.file('word/settings.xml', s.replace(/<w:mailMerge[\s\S]*?<\/w:mailMerge>/g, ''));
    }
  }
  var fRels = zip.file('word/_rels/settings.xml.rels');
  if (fRels) {
    var r = await fRels.async('string');
    var novoR = r.replace(/<Relationship(?=[^>]*Type="[^"]*(?:recipientData|mailMergeSource)[^"]*")[^>]*\/>/g, '');
    if (novoR !== r) zip.file('word/_rels/settings.xml.rels', novoR);
  }
  if (zip.file('word/recipientData.xml')) {
    zip.remove('word/recipientData.xml');
  }
  var fCt = zip.file('[Content_Types].xml');
  if (fCt) {
    var c = await fCt.async('string');
    var novoC = c.replace(/<Override PartName="\/word\/recipientData\.xml"[^>]*\/>/g, '');
    if (novoC !== c) zip.file('[Content_Types].xml', novoC);
  }
}

async function abrirModeloCertificado(arrayBuffer) {
  await carregarJSZip();
  var zip = await window.JSZip.loadAsync(arrayBuffer);
  var fDoc = zip.file('word/document.xml');
  if (!fDoc) throw new Error('Modelo inválido: não é um .docx válido (word/document.xml não encontrado).');
  var xml = await fDoc.async('string');
  var campos = {};
  var m;
  _campoScanRe.lastIndex = 0;
  while ((m = _campoScanRe.exec(xml)) !== null) campos[m[1]] = true;
  return { campos: Object.keys(campos).sort() };
}

async function gerarCertificados(templateBuf, pessoas, mapeamento) {
  await carregarJSZip();
  var JSZipLib = window.JSZip;
  var zipSaida = new JSZipLib();
  for (var i = 0; i < pessoas.length; i++) {
    var pessoa = pessoas[i];
    var zip = await JSZipLib.loadAsync(templateBuf);
    var fDoc = zip.file('word/document.xml');
    if (!fDoc) throw new Error('Modelo inválido: não é um .docx válido.');
    var xml = await fDoc.async('string');
    var valores = {};
    for (var campo in mapeamento) {
      if (!Object.prototype.hasOwnProperty.call(mapeamento, campo)) continue;
      var chave = mapeamento[campo];
      if (!chave) continue;
      valores[campo] = pessoa[chave] != null ? pessoa[chave] : '';
    }
    xml = preencherXmlDocumento(xml, valores);
    if (xml.indexOf('MERGEFIELD') !== -1) throw new Error('Não foi possível substituir todos os campos do modelo.');
    zip.file('word/document.xml', xml);
    await limparMalaDireta(zip);
    var blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    var nome = String(pessoa.nome || ('pessoa-' + (i + 1))).replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim() || ('pessoa-' + (i + 1));
    var dados = await blob.arrayBuffer();
    zipSaida.file(String(i + 1).padStart(2, '0') + ' - ' + nome + '.docx', new Uint8Array(dados));
  }
  var finalBlob = await zipSaida.generateAsync({ type: 'blob' });
  return { blob: finalBlob, total: pessoas.length };
}

// ── Parsers de entrada de pessoas ──
function parsearListaTexto(texto) {
  var linhas = String(texto || '').split(/\r?\n/).map(function(l) { return l.trim(); }).filter(Boolean);
  var pessoas = [];
  for (var i = 0; i < linhas.length; i++) {
    var partes = linhas[i].split('\t');
    if (partes.length < 2) partes = linhas[i].split(';');
    if (partes.length < 2) partes = linhas[i].split(',');
    var nome = (partes[0] || '').trim();
    var cpf = (partes[1] || '').trim();
    var funcao = (partes[2] || '').trim();
    if (i === 0 && /^(nome|name)/i.test(nome)) continue;
    if (nome || cpf) pessoas.push({ nome: nome, cpf: cpf, funcao: funcao });
  }
  return pessoas;
}

function parsearListaNomeCpf(textoNomes, textoCpfs) {
  var nomes = String(textoNomes || '').split(/\r?\n/).map(function(l) { return l.trim(); }).filter(Boolean);
  var cpfs = String(textoCpfs || '').split(/\r?\n/).map(function(l) { return l.trim(); }).filter(Boolean);
  if (nomes.length && /^(nomes?|names?)$/i.test(nomes[0])) nomes.shift();
  if (cpfs.length && /^cpfs?$/i.test(cpfs[0])) cpfs.shift();
  if (nomes.length !== cpfs.length) return { ok: false, nomes: nomes.length, cpfs: cpfs.length, pessoas: [] };
  var pessoas = [];
  for (var i = 0; i < nomes.length; i++) {
    pessoas.push({ nome: nomes[i], cpf: cpfs[i], funcao: '' });
  }
  return { ok: true, nomes: nomes.length, cpfs: cpfs.length, pessoas: pessoas };
}

function lerCsvCert(texto) {
  var linhas = String(texto || '').split(/\r?\n/).map(function(l) { return l.trim(); }).filter(Boolean);
  var pessoas = [];
  for (var i = 0; i < linhas.length; i++) {
    var partes = linhas[i].split(';');
    if (partes.length < 2) partes = linhas[i].split(',');
    var nome = (partes[0] || '').trim();
    var cpf = (partes[1] || '').trim();
    var funcao = (partes[2] || '').trim();
    if (i === 0 && /^(nome|name)/i.test(nome)) continue;
    if (nome || cpf) pessoas.push({ nome: nome, cpf: cpf, funcao: funcao });
  }
  return pessoas;
}

async function lerExcelCert(file) {
  await carregarExcelJS();
  var wb = new window.ExcelJS.Workbook();
  var buf = await file.arrayBuffer();
  await wb.xlsx.load(buf);
  var ws = wb.worksheets[0];
  if (!ws) throw new Error('Planilha sem abas.');
  var pessoas = [];
  ws.eachRow(function(row, num) {
    if (num === 1) return;
    var vals = row.values;
    var nome = vals && vals[1] ? String(vals[1]).trim() : '';
    var cpf = vals && vals[2] ? String(vals[2]).trim() : '';
    var funcao = vals && vals[3] ? String(vals[3]).trim() : '';
    if (nome || cpf) pessoas.push({ nome: nome, cpf: cpf, funcao: funcao });
  });
  return pessoas;
}
