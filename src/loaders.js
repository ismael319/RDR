// Carregamento sob demanda das bibliotecas pesadas
var _rdrLoaders = {
  excelJS: null,
  docx: null,
  chartJS: null,
  jszip: null,
  docxPreview: null,
  html2canvas: null
};
function carregarExcelJS() {
  if (_rdrLoaders.excelJS) return _rdrLoaders.excelJS;
  if (window.ExcelJS) return Promise.resolve();
  _rdrLoaders.excelJS = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
    s.onload = resolve;
    s.onerror = function() { _rdrLoaders.excelJS = null; reject(new Error('Falha ao carregar ExcelJS')); };
    document.head.appendChild(s);
  });
  return _rdrLoaders.excelJS;
}
function carregarDocx() {
  if (_rdrLoaders.docx) return _rdrLoaders.docx;
  if (window.docx) return Promise.resolve();
  _rdrLoaders.docx = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/docx@9.7.1/dist/index.umd.cjs';
    s.onload = resolve;
    s.onerror = function() { _rdrLoaders.docx = null; reject(new Error('Falha ao carregar docx')); };
    document.head.appendChild(s);
  });
  return _rdrLoaders.docx;
}
function carregarChartJS() {
  if (_rdrLoaders.chartJS) return _rdrLoaders.chartJS;
  if (window.Chart) return Promise.resolve();
  _rdrLoaders.chartJS = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
    s.onload = resolve;
    s.onerror = function() { _rdrLoaders.chartJS = null; reject(new Error('Falha ao carregar Chart.js')); };
    document.head.appendChild(s);
  });
  return _rdrLoaders.chartJS;
}
function carregarJSZip() {
  if (_rdrLoaders.jszip) return _rdrLoaders.jszip;
  if (window.JSZip) return Promise.resolve();
  _rdrLoaders.jszip = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
    s.onload = resolve;
    s.onerror = function() { _rdrLoaders.jszip = null; reject(new Error('Falha ao carregar JSZip')); };
    document.head.appendChild(s);
  });
  return _rdrLoaders.jszip;
}
function carregarDocxPreview() {
  if (_rdrLoaders.docxPreview) return _rdrLoaders.docxPreview;
  if (window.docxPreview) return Promise.resolve();
  _rdrLoaders.docxPreview = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/docx-preview@0.3.3/dist/docx-preview.min.js';
    s.onload = resolve;
    s.onerror = function() { _rdrLoaders.docxPreview = null; reject(new Error('Falha ao carregar docx-preview')); };
    document.head.appendChild(s);
  });
  return _rdrLoaders.docxPreview;
}
function carregarHtml2canvas() {
  if (_rdrLoaders.html2canvas) return _rdrLoaders.html2canvas;
  if (window.html2canvas) return Promise.resolve();
  _rdrLoaders.html2canvas = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    s.onload = resolve;
    s.onerror = function() { _rdrLoaders.html2canvas = null; reject(new Error('Falha ao carregar html2canvas')); };
    document.head.appendChild(s);
  });
  return _rdrLoaders.html2canvas;
}
