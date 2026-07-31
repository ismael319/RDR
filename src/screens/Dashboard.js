// ── DASHBOARD ──
function DashboardScreen({
  onBack,
  onVerRegistros
}) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const catRef = useRef(null);
  const tecRef = useRef(null);
  const mesRef = useRef(null);
  const chartInstances = useRef({});
  useEffect(() => {
    const unsub = fsdb.subscribeRecords(dados => {
      setRegistros(dados);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  useEffect(() => {
    // Gráficos temporariamente desativados (Chart.js removido para diagnóstico)
  }, [registros, loading]);
  async function exportarExcel() {
    const hojeKey = new Date().toLocaleDateString('en-CA');
    const mesAtual = hojeKey.slice(0, 7);
    const totalR = registros.length;
    const concluidosR = registros.filter(r => r.concluido === "SIM").length;
    const pendentesR = registros.filter(r => r.concluido === "NÃO").length;
    const doMesR = registros.filter(r => r.dataOcorrido?.slice(0, 7) === mesAtual).length;
    const txConclusaoR = totalR > 0 ? Math.round(concluidosR / totalR * 100) : 0;
    const catCount = {};
    registros.forEach(r => (r.categorias || []).forEach(c => {
      catCount[c] = (catCount[c] || 0) + 1;
    }));
    const catOrd = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
    const tecCount = {};
    registros.forEach(r => {
      if (r.autorNome) tecCount[r.autorNome] = (tecCount[r.autorNome] || 0) + 1;
    });
    const tecOrd = Object.entries(tecCount).sort((a, b) => b[1] - a[1]);
    const mesCount = {};
    registros.forEach(r => {
      if (!r.dataOcorrido) return;
      const k = r.dataOcorrido.slice(0, 7);
      mesCount[k] = (mesCount[k] || 0) + 1;
    });
    const mesOrd = Object.entries(mesCount).sort((a, b) => a[0].localeCompare(b[0]));
    try {
      await carregarExcelJS();
      const ExcelJS = window.ExcelJS;
      if (!ExcelJS) {
        alert('Biblioteca ExcelJS não carregada.');
        return;
      }
      const wb = new ExcelJS.Workbook();
      wb.creator = 'RDR - BDR Segurança';
      wb.created = new Date();
      const C = {
        bg: 'FF1A1A1A',
        red: 'FFC0392B',
        gold: 'FFF5C518',
        green: 'FF1E8449',
        blue: 'FF1A5276',
        white: 'FFFFFFFF',
        preto: 'FF000000',
        grayL: 'FFF2F3F4'
      };
      const fnt = (sz, b, cr, nm = 'Calibri') => ({
        name: nm,
        size: sz,
        bold: b,
        color: {
          argb: cr || C.preto
        }
      });
      const fll = c => ({
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: c
        }
      });
      const aln = (h, v) => ({
        horizontal: h || 'left',
        vertical: v || 'center'
      });
      const bdr = (s, cr) => ({
        style: s || 'thin',
        color: {
          argb: cr || 'FFCCCCCC'
        }
      });
      const bdrA = (s, cr) => ({
        top: bdr(s, cr),
        bottom: bdr(s, cr),
        left: bdr(s, cr),
        right: bdr(s, cr)
      });
      const barVisual = (qtd, max) => '█'.repeat(Math.max(1, Math.round(qtd / (max || 1) * 20)));

      // ───── ABA 1: RESUMO ─────
      const ws = wb.addWorksheet('Resumo');
      ws.getColumn(1).width = 30;
      ws.getColumn(2).width = 14;
      ws.getColumn(3).width = 14;
      ws.getColumn(4).width = 26;
      ws.mergeCells('A1:D1');
      let c = ws.getCell('A1');
      c.value = 'RELATÓRIO RDR — GESTÃO DE DESVIOS';
      c.font = fnt(18, true, C.white);
      c.fill = fll(C.bg);
      c.alignment = aln('center', 'center');
      c.border = bdrA('medium', C.red);
      ws.mergeCells('A2:D2');
      c = ws.getCell('A2');
      c.value = 'BDR Segurança do Trabalho';
      c.font = fnt(10, false, 'FF999999');
      c.fill = fll(C.bg);
      c.alignment = aln('center', 'center');
      c.border = {
        top: bdr(),
        bottom: bdr('medium'),
        left: bdr('medium', C.red),
        right: bdr('medium', C.red)
      };
      ws.mergeCells('A4:D4');
      c = ws.getCell('A4');
      c.value = 'INDICADORES GERAIS';
      c.font = fnt(11, true, C.white);
      c.fill = fll(C.red);
      c.alignment = aln('left', 'center');
      c.border = bdrA('medium', 'FF8E1F11');
      ['A5', 'B5', 'C5'].forEach((a, i) => {
        c = ws.getCell(a);
        c.value = ['Indicador', '', 'Valor'][i];
        c.font = fnt(10, true, C.white);
        c.fill = fll('FF2C3E50');
        c.alignment = aln('center', 'center');
        c.border = bdrA();
      });
      [['Total de Registros', '', totalR], ['Registros Este Mês', '', doMesR], ['Concluídos', '', concluidosR], ['Pendentes', '', pendentesR], ['Taxa de Conclusão', '', txConclusaoR / 100]].forEach((row, i) => {
        const r = 6 + i;
        const par = i % 2 === 0;
        const bg = par ? C.grayL : C.white;
        ['A', 'B', 'C'].forEach((a, j) => {
          c = ws.getCell(`${a}${r}`);
          c.value = row[j];
          c.font = fnt(j === 0 ? 9 : j === 2 ? 12 : 10, j !== 1, j === 0 ? 'FFAAAAAA' : j === 2 ? C.red : C.preto);
          c.fill = fll(bg);
          c.alignment = aln('center', 'center');
          c.border = bdrA();
        });
        if (i === 4) ws.getCell(`C${r}`).numFmt = '0%';
      });
      const catStart = 12;
      ws.mergeCells(`A${catStart}:D${catStart}`);
      c = ws.getCell(`A${catStart}`);
      c.value = 'DESVIOS POR CATEGORIA';
      c.font = fnt(11, true, C.preto);
      c.fill = fll(C.gold);
      c.alignment = aln('left', 'center');
      c.border = bdrA('medium', 'FFB7950B');
      const catHdr = catStart + 1;
      ['Categoria', 'Quantidade', '% do Total'].forEach((v, i) => {
        c = ws.getCell(`${String.fromCharCode(65 + i)}${catHdr}`);
        c.value = v;
        c.font = fnt(10, true, C.white);
        c.fill = fll('FF2C3E50');
        c.alignment = aln('center', 'center');
        c.border = bdrA();
      });
      const maxCat = catOrd[0]?.[1] || 1;
      catOrd.forEach(([cat, qtd], i) => {
        const r = catHdr + 1 + i;
        const par = i % 2 === 0;
        const bg = par ? C.grayL : C.white;
        ws.getCell(`A${r}`).value = cat;
        ws.getCell(`A${r}`).font = fnt(10, false, C.preto);
        ws.getCell(`A${r}`).fill = fll(bg);
        ws.getCell(`A${r}`).border = bdrA();
        ws.getCell(`B${r}`).value = qtd;
        ws.getCell(`B${r}`).font = fnt(10, false, C.preto);
        ws.getCell(`B${r}`).fill = fll(bg);
        ws.getCell(`B${r}`).border = bdrA();
        ws.getCell(`B${r}`).alignment = aln('center', 'center');
        ws.getCell(`C${r}`).value = qtd / totalR;
        ws.getCell(`C${r}`).numFmt = '0%';
        ws.getCell(`C${r}`).fill = fll(bg);
        ws.getCell(`C${r}`).border = bdrA();
        ws.getCell(`C${r}`).alignment = aln('center', 'center');
        ws.getCell(`D${r}`).value = barVisual(qtd, maxCat);
        ws.getCell(`D${r}`).font = fnt(10, true, C.red);
        ws.getCell(`D${r}`).fill = fll(bg);
        ws.getCell(`D${r}`).border = bdrA();
      });
      const tecStart = catStart + catOrd.length + 3;
      ws.mergeCells(`A${tecStart}:D${tecStart}`);
      c = ws.getCell(`A${tecStart}`);
      c.value = 'REGISTROS POR TST';
      c.font = fnt(11, true, C.white);
      c.fill = fll(C.blue);
      c.alignment = aln('left', 'center');
      c.border = bdrA('medium', 'FF154360');
      const tecHdr = tecStart + 1;
      ['TST', 'Quantidade', '% do Total'].forEach((v, i) => {
        c = ws.getCell(`${String.fromCharCode(65 + i)}${tecHdr}`);
        c.value = v;
        c.font = fnt(10, true, C.white);
        c.fill = fll('FF2C3E50');
        c.alignment = aln('center', 'center');
        c.border = bdrA();
      });
      const maxTec = tecOrd[0]?.[1] || 1;
      tecOrd.forEach(([nome, qtd], i) => {
        const r = tecHdr + 1 + i;
        const par = i % 2 === 0;
        const bg = par ? C.grayL : C.white;
        ws.getCell(`A${r}`).value = nome;
        ws.getCell(`A${r}`).font = fnt(10, false, C.preto);
        ws.getCell(`A${r}`).fill = fll(bg);
        ws.getCell(`A${r}`).border = bdrA();
        ws.getCell(`B${r}`).value = qtd;
        ws.getCell(`B${r}`).font = fnt(10, false, C.preto);
        ws.getCell(`B${r}`).fill = fll(bg);
        ws.getCell(`B${r}`).border = bdrA();
        ws.getCell(`B${r}`).alignment = aln('center', 'center');
        ws.getCell(`C${r}`).value = qtd / totalR;
        ws.getCell(`C${r}`).numFmt = '0%';
        ws.getCell(`C${r}`).fill = fll(bg);
        ws.getCell(`C${r}`).border = bdrA();
        ws.getCell(`C${r}`).alignment = aln('center', 'center');
        ws.getCell(`D${r}`).value = barVisual(qtd, maxTec);
        ws.getCell(`D${r}`).font = fnt(10, true, C.blue);
        ws.getCell(`D${r}`).fill = fll(bg);
        ws.getCell(`D${r}`).border = bdrA();
      });
      const mesStart = tecStart + tecOrd.length + 3;
      ws.mergeCells(`A${mesStart}:D${mesStart}`);
      c = ws.getCell(`A${mesStart}`);
      c.value = 'EVOLUÇÃO MENSAL';
      c.font = fnt(11, true, C.white);
      c.fill = fll(C.green);
      c.alignment = aln('left', 'center');
      c.border = bdrA('medium', 'FF145A32');
      const mesHdr = mesStart + 1;
      ['Mês', 'Quantidade'].forEach((v, i) => {
        c = ws.getCell(`${String.fromCharCode(65 + i)}${mesHdr}`);
        c.value = v;
        c.font = fnt(10, true, C.white);
        c.fill = fll('FF2C3E50');
        c.alignment = aln('center', 'center');
        c.border = bdrA();
      });
      const maxMes = Math.max(...mesOrd.map(([, q]) => q), 1);
      mesOrd.forEach(([mes, qtd], i) => {
        const r = mesHdr + 1 + i;
        const par = i % 2 === 0;
        const bg = par ? C.grayL : C.white;
        const [yr, m] = mes.split('-');
        ws.getCell(`A${r}`).value = `${m}/${yr}`;
        ws.getCell(`A${r}`).font = fnt(10, false, C.preto);
        ws.getCell(`A${r}`).fill = fll(bg);
        ws.getCell(`A${r}`).border = bdrA();
        ws.getCell(`B${r}`).value = qtd;
        ws.getCell(`B${r}`).font = fnt(10, false, C.preto);
        ws.getCell(`B${r}`).fill = fll(bg);
        ws.getCell(`B${r}`).border = bdrA();
        ws.getCell(`B${r}`).alignment = aln('center', 'center');
        ws.getCell(`C${r}`).value = barVisual(qtd, maxMes);
        ws.getCell(`C${r}`).font = fnt(10, true, C.green);
        ws.getCell(`C${r}`).fill = fll(bg);
        ws.getCell(`C${r}`).border = bdrA();
      });

      // ───── ABA 2: DETALHAMENTO ─────
      const wsDet = wb.addWorksheet('Detalhamento');
      const detH = ['Nº', 'Data', 'Hora', 'TST', 'Local', 'Categorias', 'Status', 'Colaborador', 'Resp. Setor', 'Resp. Registro', 'Descrição', 'Sugestão de Correção'];
      const detW = [5, 12, 8, 20, 20, 24, 10, 20, 20, 20, 45, 45];
      detH.forEach((h, i) => {
        wsDet.getColumn(i + 1).width = detW[i];
        c = wsDet.getCell(1, i + 1);
        c.value = h;
        c.font = fnt(10, true, C.white);
        c.fill = fll('FF2C3E50');
        c.alignment = aln('center', 'center');
        c.border = bdrA('thin', 'FF999999');
      });
      [...registros].sort((a, b) => (b.dataOcorrido || "").localeCompare(a.dataOcorrido || "")).forEach((r, i) => {
        const row = i + 2;
        const st = r.concluido || '';
        const stClr = st === 'SIM' ? 'FF1A7D42' : st === 'NÃO' ? 'FFA93226' : C.preto;
        const stBg = st === 'SIM' ? 'FFE8F8F0' : st === 'NÃO' ? 'FFFDEDEC' : i % 2 === 0 ? C.grayL : C.white;
        const vals = [i + 1, r.dataOcorrido?.split('-').reverse().join('/') || '', r.hora || '', r.autorNome || '', r.local || '', (r.categorias || []).join(' | '), st, r.nomeColaborador || '', r.responsavelSetor || '', r.responsavelRegistro || '', r.descricao || '', r.sugestaoCorrecao || ''];
        vals.forEach((v, j) => {
          c = wsDet.getCell(row, j + 1);
          c.value = v;
          c.font = fnt(10, false, stClr);
          c.fill = fll(stBg);
          c.border = bdrA();
          if (j === 6 && st) c.font = fnt(10, true, stClr);
        });
      });
      wsDet.views = [{
        state: 'frozen',
        ySplit: 1
      }];

      // ───── ABA 3: PENDENTES ─────
      const pends = registros.filter(r => r.concluido === "NÃO" || !r.concluido).slice().sort((a, b) => (a.dataOcorrido || "").localeCompare(b.dataOcorrido || ""));
      if (pends.length > 0) {
        const wsP = wb.addWorksheet('Pendentes');
        const pW = [5, 12, 14, 20, 20, 24, 45, 45, 20];
        const pH = ['Nº', 'Data', 'Dias em Aberto', 'TST', 'Local', 'Categorias', 'Descrição', 'Sugestão de Correção', 'Resp. Setor'];
        pH.forEach((h, i) => {
          wsP.getColumn(i + 1).width = pW[i];
          c = wsP.getCell(1, i + 1);
          c.value = h;
          c.font = fnt(10, true, C.white);
          c.fill = fll('FFA93226');
          c.alignment = aln('center', 'center');
          c.border = bdrA();
        });
        pends.forEach((r, i) => {
          const row = i + 2;
          const dias = r.dataOcorrido ? Math.max(0, Math.floor((new Date() - new Date(r.dataOcorrido + 'T12:00:00')) / (1000 * 60 * 60 * 24))) : '';
          const urg = typeof dias === 'number' && dias > 7;
          const bg = urg ? 'FFFDEDEC' : 'FFFFF9F9';
          const vals = [i + 1, r.dataOcorrido?.split('-').reverse().join('/') || '', dias, r.autorNome || '', r.local || '', (r.categorias || []).join(' | '), r.descricao || '', r.sugestaoCorrecao || '', r.responsavelSetor || ''];
          vals.forEach((v, j) => {
            c = wsP.getCell(row, j + 1);
            c.value = v;
            c.font = {
              name: 'Calibri',
              size: 10,
              bold: j === 2 && urg,
              color: {
                argb: j === 2 && urg ? C.white : C.preto
              }
            };
            c.fill = fll(j === 2 && urg ? C.red : bg);
            c.border = bdrA();
          });
        });
        wsP.views = [{
          state: 'frozen',
          ySplit: 1
        }];
      }

      // ───── ABA 4: POR TÉCNICO ─────
      const tecNomes = Object.keys(tecCount).sort();
      if (tecNomes.length > 0) {
        const wsT = wb.addWorksheet('Por Técnico');
        [20, 20, 28, 12, 50].forEach((w, i) => wsT.getColumn(i + 1).width = w);
        let row = 1;
        wsT.mergeCells(1, 1, 1, 5);
        c = wsT.getCell('A1');
        c.value = 'DESEMPENHO POR TÉCNICO DE SEGURANÇA';
        c.font = fnt(14, true, C.white);
        c.fill = fll(C.bg);
        c.alignment = aln('center', 'center');
        c.border = bdrA('medium', C.red);
        row = 3;
        tecNomes.forEach(nome => {
          const regs = registros.filter(r => r.autorNome === nome);
          const conc = regs.filter(r => r.concluido === 'SIM').length;
          const pend = regs.filter(r => r.concluido === 'NÃO').length;
          const tx = regs.length > 0 ? Math.round(conc / regs.length * 100) : 0;
          wsT.mergeCells(row, 1, row, 5);
          c = wsT.getCell(row, 1);
          c.value = `${nome} — ${regs.length} registros, ${conc} concluídos, ${pend} pendentes, ${tx}% conclusão`;
          c.font = fnt(11, true, C.white);
          c.fill = fll(C.red);
          c.alignment = aln('left', 'center');
          c.border = bdrA('medium', 'FF8E1F11');
          row++;
          ['Data', 'Local', 'Categorias', 'Status', 'Descrição'].forEach((h, i) => {
            c = wsT.getCell(row, i + 1);
            c.value = h;
            c.font = fnt(10, true, C.white);
            c.fill = fll('FF555555');
            c.alignment = aln('center', 'center');
            c.border = bdrA();
          });
          row++;
          [...regs].sort((a, b) => (b.dataOcorrido || "").localeCompare(a.dataOcorrido || "")).forEach((r, i) => {
            const st = r.concluido;
            const par = i % 2 === 0;
            const stBg = st === 'SIM' ? 'FFE8F8F0' : st === 'NÃO' ? 'FFFDEDEC' : par ? C.grayL : C.white;
            const stClr = st === 'SIM' ? 'FF1A7D42' : st === 'NÃO' ? 'FFA93226' : C.preto;
            const vals = [r.dataOcorrido?.split('-').reverse().join('/') || '', r.local || '', (r.categorias || []).join(' | '), st || '', r.descricao || ''];
            vals.forEach((v, j) => {
              c = wsT.getCell(row, j + 1);
              c.value = v;
              c.font = fnt(10, false, stClr);
              c.fill = fll(stBg);
              c.border = bdrA();
              if (j === 3 && st) c.font = fnt(10, true, stClr);
            });
            row++;
          });
          row++;
        });
      }

      // ───── ABA 5: POR CATEGORIA ─────
      if (catOrd.length > 0) {
        const wsCat = wb.addWorksheet('Por Categoria');
        [20, 20, 20, 12, 50].forEach((w, i) => wsCat.getColumn(i + 1).width = w);
        let row = 1;
        wsCat.mergeCells(1, 1, 1, 5);
        c = wsCat.getCell('A1');
        c.value = 'ANÁLISE POR CATEGORIA DE DESVIO';
        c.font = fnt(14, true, C.white);
        c.fill = fll(C.bg);
        c.alignment = aln('center', 'center');
        c.border = bdrA('medium', C.red);
        row = 3;
        catOrd.forEach(([cat, totalCat]) => {
          const regs = registros.filter(r => (r.categorias || []).includes(cat));
          const conc = regs.filter(r => r.concluido === 'SIM').length;
          const pend = regs.filter(r => r.concluido === 'NÃO').length;
          wsCat.mergeCells(row, 1, row, 5);
          c = wsCat.getCell(row, 1);
          c.value = `${cat} — ${totalCat} ocorrências, ${conc} concluídas, ${pend} pendentes`;
          c.font = fnt(11, true, C.white);
          c.fill = fll(C.red);
          c.alignment = aln('left', 'center');
          c.border = bdrA('medium', 'FF8E1F11');
          row++;
          ['Data', 'TST', 'Local', 'Status', 'Descrição'].forEach((h, i) => {
            c = wsCat.getCell(row, i + 1);
            c.value = h;
            c.font = fnt(10, true, C.white);
            c.fill = fll('FF555555');
            c.alignment = aln('center', 'center');
            c.border = bdrA();
          });
          row++;
          [...regs].sort((a, b) => (b.dataOcorrido || "").localeCompare(a.dataOcorrido || "")).forEach((r, i) => {
            const st = r.concluido;
            const par = i % 2 === 0;
            const stBg = st === 'SIM' ? 'FFE8F8F0' : st === 'NÃO' ? 'FFFDEDEC' : par ? C.grayL : C.white;
            const stClr = st === 'SIM' ? 'FF1A7D42' : st === 'NÃO' ? 'FFA93226' : C.preto;
            const vals = [r.dataOcorrido?.split('-').reverse().join('/') || '', r.autorNome || '', r.local || '', st || '', r.descricao || ''];
            vals.forEach((v, j) => {
              c = wsCat.getCell(row, j + 1);
              c.value = v;
              c.font = fnt(10, false, stClr);
              c.fill = fll(stBg);
              c.border = bdrA();
              if (j === 3 && st) c.font = fnt(10, true, stClr);
            });
            row++;
          });
          row++;
        });
      }
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Relatorio_RDR_${hojeKey}.xlsx`;
      link.click();
      URL.revokeObjectURL(link);
    } catch (err) {
      console.error('Erro ao gerar Excel:', err);
      alert('Erro ao gerar Excel: ' + (err?.message || err));
    }
  }
  const mesKey = useMemo(() => new Date().toLocaleDateString('en-CA').slice(0, 7), []);
  const stats = useMemo(() => {
    const total = registros.length;
    const doMes = registros.filter(r => r.dataOcorrido?.slice(0, 7) === mesKey).length;
    const concluidos = registros.filter(r => r.concluido === "SIM").length;
    const pendentes = registros.filter(r => r.concluido === "NÃO").length;
    const categorias = {};
    registros.forEach(r => (r.categorias || []).forEach(cat => {
      categorias[cat] = (categorias[cat] || 0) + 1;
    }));
    const catOrd = Object.entries(categorias).sort((a, b) => b[1] - a[1]);
    return {
      total,
      doMes,
      concluidos,
      pendentes,
      tx: total > 0 ? Math.round(concluidos / total * 100) : 0,
      catOrd,
      max: catOrd[0]?.[1] || 1
    };
  }, [registros]);
  const CORES = ["#f5c518", "#27ae60", "#3498db", "#e74c3c", "#9b59b6", "#1abc9c", "#e67e22", "#2ecc71"];
  const canvasWrap = {
    maxWidth: 500,
    margin: "0 auto"
  };
  const sec = (title, hint) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 11,
      letterSpacing: 3,
      color: "#f5c518",
      textTransform: "uppercase",
      borderLeft: "2px solid #f5a623",
      paddingLeft: 8
    }
  }, title), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "rgba(255,255,255,0.3)",
      fontStyle: "italic"
    }
  }, hint));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#000000",
      paddingBottom: 40,
      color: "#ffffff"
    }
  }, /*#__PURE__*/React.createElement(Header, {
    title: "DASHBOARD",
    subtitle: `${stats.total} registros no total`,
    onBack: onBack
  }), loading ? /*#__PURE__*/React.createElement(Spinner, null) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px",
      maxWidth: 640,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,rgba(245,166,35,0.12),rgba(245,166,35,0.04))",
      border: "1px solid rgba(245,166,35,0.25)",
      borderRadius: 16,
      padding: "20px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 80,
      height: 80,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "80",
    height: "80",
    viewBox: "0 0 80 80"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "40",
    cy: "40",
    r: "34",
    fill: "none",
    stroke: "#111111",
    strokeWidth: "8"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "40",
    cy: "40",
    r: "34",
    fill: "none",
    stroke: "#f5c518",
    strokeWidth: "8",
    strokeDasharray: `${stats.tx * 2.136} 213.6`,
    strokeLinecap: "round",
    transform: "rotate(-90 40 40)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 18,
      color: "#f5c518"
    }
  }, stats.tx, "%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      letterSpacing: 2,
      color: "rgba(255,255,255,0.5)",
      textTransform: "uppercase",
      marginBottom: 4
    }
  }, "Taxa de Conclus\xE3o"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 22,
      fontWeight: 700,
      color: "#ffffff"
    }
  }, stats.concluidos, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,0.4)",
      fontWeight: 400
    }
  }, "de ", stats.total, " conclu\xEDdos")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#e74c3c",
      marginTop: 4
    }
  }, stats.pendentes, " pendente", stats.pendentes !== 1 ? "s" : ""))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 16
    }
  }, [["Total RDRs", "#f5c518", stats.total, {}, /*#__PURE__*/React.createElement(DocumentIcon, {
    size: 20
  })], ["Este mês", "#3498db", stats.doMes, {
    data: "mes"
  }, /*#__PURE__*/React.createElement(CalendarIcon, {
    size: 20
  })], ["Concluídos", "#27ae60", stats.concluidos, {
    concluido: "SIM"
  }, /*#__PURE__*/React.createElement(CheckIcon, {
    size: 20
  })], ["Pendentes", "#e74c3c", stats.pendentes, {
    concluido: "NÃO"
  }, /*#__PURE__*/React.createElement(AlertCircleIcon, null)]].map(([label, cor, val, filtro, icon]) => /*#__PURE__*/React.createElement("button", {
    key: label,
    className: "folder-tile-fx",
    onClick: () => onVerRegistros(filtro),
    style: {
      "--glow": cor,
      background: `linear-gradient(135deg,${cor}18,${cor}08)`,
      border: `1px solid ${cor}35`,
      borderRadius: 14,
      padding: "16px 14px",
      cursor: "pointer",
      textAlign: "left",
      outline: "none",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 12,
      right: 12,
      color: cor,
      opacity: 0.4
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 34,
      fontWeight: 700,
      fontFamily: "'Oswald',sans-serif",
      color: cor,
      lineHeight: 1
    }
  }, val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "rgba(232,220,200,0.45)",
      letterSpacing: 1.5,
      fontFamily: "'Oswald',sans-serif",
      textTransform: "uppercase",
      marginTop: 6
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: cor,
      marginTop: 8,
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1,
      opacity: 0.75,
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, "VER ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12
    }
  }, "\u2192"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0d0d0d",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "18px",
      marginBottom: 16
    }
  }, sec("Desvios por Categoria", "toque para filtrar"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, stats.catOrd.map(([cat, qtd], i) => {
    const pct = Math.round(qtd / stats.max * 100);
    return /*#__PURE__*/React.createElement("button", {
      key: cat,
      onClick: () => onVerRegistros({
        categoria: cat
      }),
      style: {
        width: "100%",
        background: "none",
        border: "none",
        padding: "7px 0",
        cursor: "pointer",
        outline: "none",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: CORES[i % CORES.length],
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontFamily: "'Oswald',sans-serif",
        fontSize: 12,
        color: "#ffffff",
        letterSpacing: 1,
        textAlign: "left"
      }
    }, cat), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Oswald',sans-serif",
        fontWeight: 700,
        fontSize: 13,
        color: CORES[i % CORES.length]
      }
    }, qtd)), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#111111",
        borderRadius: 4,
        height: 5,
        overflow: "hidden",
        marginLeft: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct}%`,
        height: "100%",
        background: `linear-gradient(90deg,${CORES[i % CORES.length]},${CORES[i % CORES.length]}88)`,
        borderRadius: 4,
        transition: "width 0.6s ease"
      }
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: canvasWrap
  }, stats.catOrd.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "rgba(255,255,255,0.3)",
      fontSize: 12,
      padding: 10
    }
  }, "Sem dados"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0d0d0d",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "18px",
      marginBottom: 16
    }
  }, sec("RDR por TST", "toque para filtrar"), /*#__PURE__*/React.createElement("div", {
    style: canvasWrap
  }, (() => {
    const tecnicos = {};
    registros.forEach(r => {
      if (r.autorNome) tecnicos[r.autorNome] = (tecnicos[r.autorNome] || 0) + 1;
    });
    const entries = Object.entries(tecnicos).sort((a, b) => b[1] - a[1]);
    const maxTec = entries[0]?.[1] || 1;
    if (entries.length === 0) return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        color: "rgba(255,255,255,0.3)",
        fontSize: 12,
        padding: 10
      }
    }, "Sem dados");
    return entries.map(([nome, qtd], i) => {
      const pct = Math.round(qtd / maxTec * 100);
      const tec = registros.find(r => r.autorNome === nome);
      return /*#__PURE__*/React.createElement("button", {
        key: nome,
        onClick: () => tec && onVerRegistros({
          tecnico: tec.autorId
        }),
        style: {
          width: "100%",
          background: "none",
          border: "none",
          padding: "7px 0",
          cursor: "pointer",
          outline: "none"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: CORES[i % CORES.length],
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          fontFamily: "'Oswald',sans-serif",
          fontSize: 12,
          color: "#ffffff",
          letterSpacing: 1,
          textAlign: "left"
        }
      }, nome), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: "'Oswald',sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: CORES[i % CORES.length]
        }
      }, qtd)), /*#__PURE__*/React.createElement("div", {
        style: {
          background: "#111111",
          borderRadius: 4,
          height: 5,
          overflow: "hidden",
          marginLeft: 18
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg,${CORES[i % CORES.length]},${CORES[i % CORES.length]}88)`,
          borderRadius: 4
        }
      })));
    });
  })())), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0d0d0d",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "18px",
      marginBottom: 16
    }
  }, sec("Evolução Mensal", "toque para filtrar"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...canvasWrap,
      display: "flex",
      alignItems: "flex-end",
      gap: 8,
      height: 140,
      padding: "0 4px"
    }
  }, (() => {
    const meses = {};
    registros.forEach(r => {
      if (!r.dataOcorrido) return;
      const k = r.dataOcorrido.slice(0, 7);
      meses[k] = (meses[k] || 0) + 1;
    });
    const ordenados = Object.keys(meses).sort().slice(-6);
    if (ordenados.length === 0) return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        color: "rgba(255,255,255,0.3)",
        fontSize: 12,
        padding: 10,
        width: "100%"
      }
    }, "Sem dados");
    const maxMes = Math.max(...ordenados.map(k => meses[k]), 1);
    return ordenados.map(k => {
      const [yr, m] = k.split("-");
      const altura = Math.max(meses[k] / maxMes * 100, 8);
      return /*#__PURE__*/React.createElement("button", {
        key: k,
        onClick: () => onVerRegistros({
          data: 'mes',
          mesExato: k
        }),
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          height: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          outline: "none",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: "'Oswald',sans-serif",
          fontWeight: 700,
          fontSize: 12,
          color: "#f5c518"
        }
      }, meses[k]), /*#__PURE__*/React.createElement("div", {
        style: {
          width: "70%",
          height: `${altura}%`,
          background: "linear-gradient(180deg,#f5a623,#e8930a)",
          borderRadius: "6px 6px 0 0",
          minHeight: 6
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'Oswald',sans-serif"
        }
      }, m, "/", yr.slice(2)));
    });
  })())), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: exportarExcel,
    style: {
      "--glow": "#27ae60",
      flex: 1,
      background: "linear-gradient(135deg,rgba(39,174,96,0.2),rgba(39,174,96,0.08))",
      border: "1px solid rgba(39,174,96,0.4)",
      color: "#27ae60",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 13,
      padding: "16px 10px",
      borderRadius: 14,
      cursor: "pointer",
      letterSpacing: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(DownloadIcon, null), "EXCEL DETALHADO"), /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: () => gerarPDFDashboard(registros),
    style: {
      "--glow": "#f5c518",
      flex: 1,
      background: "linear-gradient(135deg,rgba(245,166,35,0.2),rgba(245,166,35,0.08))",
      border: "1px solid rgba(245,166,35,0.4)",
      color: "#f5c518",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 13,
      padding: "16px 10px",
      borderRadius: 14,
      cursor: "pointer",
      letterSpacing: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(BarChartIcon, null), "PDF VISUAL"))));
}
