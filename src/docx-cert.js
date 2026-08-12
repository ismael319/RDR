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

async function _preencherCertificado(templateBuf, pessoa, mapeamento) {
  await carregarJSZip();
  var zip = await window.JSZip.loadAsync(templateBuf);
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
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

async function gerarCertificados(templateBuf, pessoas, mapeamento) {
  await carregarJSZip();
  var zipSaida = new window.JSZip();
  for (var i = 0; i < pessoas.length; i++) {
    var pessoa = pessoas[i];
    var blob = await _preencherCertificado(templateBuf, pessoa, mapeamento);
    var nome = String(pessoa.nome || ('pessoa-' + (i + 1))).replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim() || ('pessoa-' + (i + 1));
    var dados = await blob.arrayBuffer();
    zipSaida.file(String(i + 1).padStart(2, '0') + ' - ' + nome + '.docx', new Uint8Array(dados));
  }
  var finalBlob = await zipSaida.generateAsync({ type: 'blob' });
  return { blob: finalBlob, total: pessoas.length };
}

// ── Geração de PDF único (um certificado por página, A4 paisagem) ──
async function gerarPdfCertificados(templateBuf, pessoas, mapeamento) {
  try { await carregarJsPDF(); } catch (e) {}
  var jsPDF = getJsPDF();
  if (!jsPDF) throw new Error('Biblioteca de PDF não disponível.');
  await carregarDocxPreview();
  await carregarHtml2canvas();
  var doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  var container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;background:#ffffff;width:297mm;';
  document.body.appendChild(container);
  try {
    for (var i = 0; i < pessoas.length; i++) {
      var blob = await _preencherCertificado(templateBuf, pessoas[i], mapeamento);
      container.innerHTML = '';
      var holder = document.createElement('div');
      holder.style.cssText = 'width:297mm;background:#ffffff;';
      container.appendChild(holder);
      await window.docxPreview.renderAsync(await blob.arrayBuffer(), holder, null, { className: 'rdr-cert' });
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      await new Promise(function(r) { setTimeout(r, 60); });
      var pageEl = holder.querySelector('.docx-page') || holder;
      var canvas = await window.html2canvas(pageEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
      if (i > 0) doc.addPage('landscape', 'a4');
      doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 297, 210);
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    container.innerHTML = '';
    document.body.removeChild(container);
  }
  return doc;
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

// ── Biblioteca de modelos no Supabase Storage ──
var MODELOS_BUCKET = 'modelos';

async function listarModelos() {
  var res = await sb.storage.from(MODELOS_BUCKET).list('', { sortBy: { column: 'name', order: 'asc' } });
  if (res.error) throw res.error;
  return (res.data || []).filter(function(f) { return f.name && f.metadata && f.metadata.size > 0; }).map(function(f) {
    return {
      path: f.name,
      nome: String(f.name).replace(/\.docx$/i, ''),
      tamanho: f.metadata.size
    };
  });
}

async function baixarModelo(path) {
  var res = await sb.storage.from(MODELOS_BUCKET).download(path);
  if (res.error) throw res.error;
  return await res.data.arrayBuffer();
}

async function salvarModelo(nome, file) {
  var limpo = String(nome || '').replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
  if (!limpo) throw new Error('Nome do modelo inválido.');
  var path = limpo + '.docx';
  var res = await sb.storage.from(MODELOS_BUCKET).upload(path, file, {
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    upsert: true
  });
  if (res.error) throw res.error;
  return path;
}

async function excluirModelo(path) {
  var res = await sb.storage.from(MODELOS_BUCKET).remove([path]);
  if (res.error) throw res.error;
}

// ── Editor de texto do modelo (parágrafos do corpo do documento) ──
var _campoComplexoRe = /<w:r\b[^>]*><w:fldChar\b[^>]*w:fldCharType="begin"[^>]*\/><\/w:r>([\s\S]*?)<w:r\b[^>]*><w:fldChar\b[^>]*w:fldCharType="end"[^>]*\/><\/w:r>/g;
var _pOuTblRe = /<w:p\b[^>]*>[\s\S]*?<\/w:p>|<w:tbl\b[^>]*>[\s\S]*?<\/w:tbl>/g;

function _textoDoParagrafo(pXml) {
  var s = pXml;
  s = s.replace(_campoFldSimpleRe, function(m, attrs, campo) { return '{{' + campo + '}}'; });
  s = s.replace(_campoComplexoRe, function(m, meio) {
    var c = null;
    var mm;
    _campoScanRe.lastIndex = 0;
    while ((mm = _campoScanRe.exec(meio)) !== null) c = mm[1];
    return c ? '{{' + c + '}}' : m;
  });
  s = s.replace(/<w:br\b[^>]*\/>|<w:cr\b[^>]*\/>/g, '\n');
  s = s.replace(/<w:tab\b[^>]*\/>/g, '\t');
  s = s.replace(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g, function(m, t) { return t; });
  s = s.replace(/<[^>]+>/g, '');
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

async function extrairTextoModelo(arrayBuffer) {
  await carregarJSZip();
  var zip = await window.JSZip.loadAsync(arrayBuffer);
  var fDoc = zip.file('word/document.xml');
  if (!fDoc) throw new Error('Modelo inválido: não é um .docx válido.');
  var xml = await fDoc.async('string');
  var blocos = [];
  var m;
  var indice = 0;
  _pOuTblRe.lastIndex = 0;
  while ((m = _pOuTblRe.exec(xml)) !== null) {
    var seg = m[0];
    if (/^<w:p\b/.test(seg)) {
      var editavel = !/<\w+:(?:drawing|pict|object|txbxContent)\b/.test(seg);
      blocos.push({ indice: indice, tipo: editavel ? 'texto' : 'layout', texto: editavel ? _textoDoParagrafo(seg) : '' });
    } else {
      blocos.push({ indice: indice, tipo: 'layout', texto: '' });
    }
    indice++;
  }
  return { blocos: blocos };
}

function _fragmentarTexto(texto) {
  var partes = String(texto || '').split(/\{\{([A-Za-z0-9_]+)\}\}/);
  var seg = [];
  for (var i = 0; i < partes.length; i++) {
    if (i % 2 === 1) {
      seg.push({ campo: partes[i] });
    } else if (partes[i] !== '') {
      seg.push({ texto: partes[i] });
    }
  }
  return seg;
}

function _montarRuns(seg, rpr) {
  var out = '';
  for (var i = 0; i < seg.length; i++) {
    if (seg[i].campo) {
      out += '<w:fldSimple w:instr=" MERGEFIELD ' + seg[i].campo + ' "><w:r><w:rPr>' + rpr + '</w:rPr><w:t xml:space="preserve">' + escapaXml('«' + seg[i].campo + '»') + '</w:t></w:r></w:fldSimple>';
    } else {
      var linhas = seg[i].texto.split('\n');
      var run = '<w:r><w:rPr>' + rpr + '</w:rPr>';
      for (var j = 0; j < linhas.length; j++) {
        if (j > 0) run += '<w:br/>';
        run += '<w:t xml:space="preserve">' + escapaXml(linhas[j]) + '</w:t>';
      }
      out += run + '</w:r>';
    }
  }
  return out;
}

function _reconstruirParagrafo(pXml, texto) {
  var mOpen = pXml.match(/^<w:p\b[^>]*>/);
  var open = mOpen ? mOpen[0] : '<w:p>';
  var mPpr = pXml.match(/<w:pPr\b[^>]*>[\s\S]*?<\/w:pPr>/);
  var ppr = mPpr ? mPpr[0] : '';
  var mRpr = pXml.match(_rPrRe);
  var rpr = mRpr ? mRpr[1] : '';
  return open + ppr + _montarRuns(_fragmentarTexto(texto), rpr) + '</w:p>';
}

async function reconstruirModelo(arrayBuffer, edicoes) {
  await carregarJSZip();
  var zip = await window.JSZip.loadAsync(arrayBuffer);
  var fDoc = zip.file('word/document.xml');
  if (!fDoc) throw new Error('Modelo inválido: não é um .docx válido.');
  var xml = await fDoc.async('string');
  var substituicoes = [];
  var m;
  var indice = 0;
  _pOuTblRe.lastIndex = 0;
  while ((m = _pOuTblRe.exec(xml)) !== null) {
    var seg = m[0];
    if (/^<w:p\b/.test(seg) && Object.prototype.hasOwnProperty.call(edicoes, indice)) {
      substituicoes.push({ start: m.index, end: m.index + seg.length, novo: _reconstruirParagrafo(seg, edicoes[indice]) });
    }
    indice++;
  }
  if (!substituicoes.length) return arrayBuffer;
  var novoXml = '';
  var pos = 0;
  for (var i = 0; i < substituicoes.length; i++) {
    novoXml += xml.slice(pos, substituicoes[i].start) + substituicoes[i].novo;
    pos = substituicoes[i].end;
  }
  novoXml += xml.slice(pos);
  zip.file('word/document.xml', novoXml);
  var blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  return await blob.arrayBuffer();
}
