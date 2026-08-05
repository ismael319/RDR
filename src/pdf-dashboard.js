async function gerarPDFDashboard(registros, ctx = {}) {
  try {
    await carregarJsPDF();
    const jsPDF = getJsPDF();
    if (!jsPDF) {
      alert("Não foi possível carregar o gerador de PDF. Verifique sua conexão e tente novamente.");
      return;
    }
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    const W = 210,
      margin = 16,
      col = W - margin * 2;
    let y = 18;
    const CORES = [[245, 166, 35], [39, 174, 96], [52, 152, 219], [231, 76, 60], [155, 89, 182], [26, 188, 156], [230, 126, 34], [46, 204, 113]];
    const ln = (x1, y1, x2, y2, c = [200, 200, 200]) => {
      doc.setDrawColor(...c);
      doc.line(x1, y1, x2, y2);
    };
    const rc = (x, yy, w, h, f = [245, 245, 245]) => {
      doc.setFillColor(...f);
      doc.rect(x, yy, w, h, "F");
    };
    const tx = (t, x, yy, s = 10, b = false, c = [30, 30, 30], align = "left") => {
      doc.setFontSize(s);
      doc.setFont("Arial", b ? "bold" : "normal");
      doc.setTextColor(...c);
      doc.text(String(t ?? ""), x, yy, {
        align
      });
    };
    const quebraPagina = (limite = 250) => {
      if (y > limite) {
        doc.addPage();
        y = 20;
      }
    };

    // ── Cálculos ──
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeKey = hoje.toLocaleDateString('en-CA');
    const total = registros.length;
    const concluidos = registros.filter(r => r.concluido === "SIM").length;
    const pendentes = registros.filter(r => r.concluido !== "SIM").length;
    const txConclusao = total > 0 ? Math.round(concluidos / total * 100) : 0;
    const atrasados = pendentes.filter(r => {
      const occ = r.dataOcorrido ? new Date(r.dataOcorrido + 'T12:00:00') : null;
      const dias = occ ? Math.max(0, Math.floor((hoje - occ) / 86400000)) : 0;
      if (dias > 7) return true;
      if (r.prazo && new Date(r.prazo + 'T23:59:59') < hoje) return true;
      return false;
    }).length;
    const diasEmAberto = pendentes.length ? Math.round(pendentes.reduce((acc, r) => {
      const occ = r.dataOcorrido ? new Date(r.dataOcorrido + 'T12:00:00') : hoje;
      return acc + Math.max(0, Math.floor((hoje - occ) / 86400000));
    }, 0) / pendentes.length) : 0;
    const recs = ctx.reconhecimentos ?? 0;
    const catCount = {};
    registros.forEach(r => (r.categorias || []).forEach(c => {
      if (c !== 'Reconhecimento') catCount[c] = (catCount[c] || 0) + 1;
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
    const mesOrd = Object.entries(mesCount).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    const locCount = {};
    registros.forEach(r => {
      if (r.local && r.local.trim()) {
        const l = r.local.trim();
        locCount[l] = (locCount[l] || 0) + 1;
      }
    });
    const locOrd = Object.entries(locCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const tituloPeriodo = ctx.titulo || "Todo o período";
    const filtrosTxt = ctx.filtros || "";

    // ── CABEÇALHO ──
    rc(0, 0, W, 34, [20, 40, 60]);
    tx("BDR", margin, 16, 22, true, [245, 166, 35]);
    tx("Relatório de Indicadores RDR", margin, 24, 11, true, [255, 255, 255]);
    tx(tituloPeriodo, margin, 30, 8, false, [200, 200, 200]);
    tx(new Date().toLocaleDateString("pt-BR"), W - margin, 16, 10, true, [255, 255, 255], "right");
    tx(`${total} desvios`, W - margin, 22, 9, false, [200, 200, 200], "right");
    if (filtrosTxt) tx(filtrosTxt, W - margin, 27, 7, false, [200, 200, 200], "right");
    y = 44;

    // ── CARDS DE INDICADORES ──
    const cardW = (col - 12) / 4,
      cardH = 24;
    const cards = [["Total", total, [245, 166, 35]], ["Concluídos", concluidos, [39, 174, 96]], ["Pendentes", pendentes, [231, 76, 60]], ["Em Atraso", atrasados, [230, 126, 34]]];
    cards.forEach((c, i) => {
      const cx = margin + i * (cardW + 4);
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, "F");
      doc.setDrawColor(...c[2]);
      doc.setLineWidth(0.6);
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, "S");
      tx(c[1], cx + cardW / 2, y + 13, 18, true, c[2], "center");
      tx(c[0].toUpperCase(), cx + cardW / 2, y + 20, 7, false, [100, 100, 100], "center");
    });
    y += cardH + 10;

    // ── ANEL DE TAXA DE CONCLUSÃO + INFO ──
    rc(margin, y, col, 20, [240, 244, 248]);
    tx("TAXA DE CONCLUSÃO", margin + 2, y + 5.5, 8, true, [100, 120, 140]);
    y += 16;
    const cxAnel = margin + 18,
      cyAnel = y + 14,
      raio = 14;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(4);
    doc.circle(cxAnel, cyAnel, raio, "S");
    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(4);
    const passos = Math.round(txConclusao / 100 * 72);
    for (let i = 0; i < passos; i++) {
      const ang1 = (-90 + i * 5) * Math.PI / 180;
      const ang2 = (-90 + (i + 1) * 5) * Math.PI / 180;
      doc.line(cxAnel + raio * Math.cos(ang1), cyAnel + raio * Math.sin(ang1), cxAnel + raio * Math.cos(ang2), cyAnel + raio * Math.sin(ang2));
    }
    tx(`${txConclusao}%`, cxAnel, cyAnel + 2, 12, true, [245, 166, 35], "center");
    tx(`${concluidos} de ${total} desvios concluídos`, margin + 42, y + 10, 10, false, [60, 60, 60]);
    tx(`${pendentes} pendente${pendentes !== 1 ? "s" : ""} de ação · ${atrasados} em atraso`, margin + 42, y + 17, 9, false, [231, 76, 60]);
    y += 38;
    quebraPagina();

    // ── GRÁFICO DE BARRAS: CATEGORIAS ──
    if (catOrd.length > 0) {
      rc(margin, y, col, 8, [240, 244, 248]);
      tx("DESVIOS POR CATEGORIA", margin + 2, y + 5.5, 8, true, [100, 120, 140]);
      y += 12;
      const maxCat = catOrd[0][1];
      const barH = 7,
        gap = 3,
        chartW = col - 50;
      catOrd.forEach(([cat, qtd], i) => {
        const by = y + i * (barH + gap);
        const w = Math.max(qtd / maxCat * chartW, 3);
        const cor = CORES[i % CORES.length];
        tx(cat, margin, by + 5, 8, false, [60, 60, 60]);
        doc.setFillColor(...cor);
        doc.roundedRect(margin + 44, by, w, barH, 1, 1, "F");
        tx(qtd, margin + 44 + w + 3, by + 5, 8, true, cor);
      });
      y += catOrd.length * (barH + gap) + 8;
      quebraPagina();
    }

    // ── GRÁFICO DE PIZZA: TÉCNICOS ──
    if (tecOrd.length > 0) {
      rc(margin, y, col, 8, [240, 244, 248]);
      tx("REGISTROS POR TÉCNICO", margin + 2, y + 5.5, 8, true, [100, 120, 140]);
      y += 14;
      const cxPizza = margin + 24,
        cyPizza = y + 20,
        raioPizza = 20;
      let anguloInicio = -90;
      tecOrd.forEach(([nome, qtd], i) => {
        const fatiaGraus = qtd / total * 360;
        const anguloFim = anguloInicio + fatiaGraus;
        const cor = CORES[i % CORES.length];
        doc.setFillColor(...cor);
        const segmentos = Math.max(1, Math.ceil(fatiaGraus / 4));
        for (let s = 0; s < segmentos; s++) {
          const ai = anguloInicio + fatiaGraus * s / segmentos;
          const af = anguloInicio + fatiaGraus * (s + 1) / segmentos;
          const rad1 = ai * Math.PI / 180,
            rad2 = af * Math.PI / 180;
          doc.triangle(cxPizza, cyPizza, cxPizza + raioPizza * Math.cos(rad1), cyPizza + raioPizza * Math.sin(rad1), cxPizza + raioPizza * Math.cos(rad2), cyPizza + raioPizza * Math.sin(rad2), "F");
        }
        anguloInicio = anguloFim;
      });
      const legX = margin + 56;
      tecOrd.forEach(([nome, qtd], i) => {
        const ly = y + 4 + i * 7;
        const cor = CORES[i % CORES.length];
        doc.setFillColor(...cor);
        doc.rect(legX, ly - 3, 4, 4, "F");
        tx(`${nome}`, legX + 7, ly, 8, false, [60, 60, 60]);
        tx(`${qtd} (${Math.round(qtd / total * 100)}%)`, legX + 7 + 45, ly, 8, true, cor);
      });
      y += Math.max(44, tecOrd.length * 7 + 10);
      quebraPagina(235);
    }

    // ── GRÁFICO DE BARRAS: LOCAIS ──
    if (locOrd.length > 0) {
      rc(margin, y, col, 8, [240, 244, 248]);
      tx("LOCAIS COM MAIS DESVIOS", margin + 2, y + 5.5, 8, true, [100, 120, 140]);
      y += 12;
      const maxLoc = locOrd[0][1];
      const barH = 7,
        gap = 3,
        chartW = col - 62;
      locOrd.forEach(([local, qtd], i) => {
        const by = y + i * (barH + gap);
        const w = Math.max(qtd / maxLoc * chartW, 3);
        const cor = CORES[i % CORES.length];
        const nome = local.length > 32 ? local.slice(0, 31) + "…" : local;
        tx(nome, margin, by + 5, 8, false, [60, 60, 60]);
        doc.setFillColor(...cor);
        doc.roundedRect(margin + 56, by, w, barH, 1, 1, "F");
        tx(qtd, margin + 56 + w + 3, by + 5, 8, true, cor);
      });
      y += locOrd.length * (barH + gap) + 8;
      quebraPagina();
    }

    // ── GRÁFICO DE LINHA: EVOLUÇÃO MENSAL ──
    if (mesOrd.length > 0) {
      rc(margin, y, col, 8, [240, 244, 248]);
      tx("EVOLUÇÃO MENSAL", margin + 2, y + 5.5, 8, true, [100, 120, 140]);
      y += 12;
      const chartH = 36,
        chartW2 = col - 10;
      const maxMes = Math.max(...mesOrd.map(([, q]) => q), 1);
      const stepX = chartW2 / (mesOrd.length - 1 || 1);
      const baseY = y + chartH;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin + 5, baseY, margin + 5 + chartW2, baseY);
      const pontos = mesOrd.map(([mes, qtd], i) => {
        const px = margin + 5 + i * stepX;
        const py = baseY - qtd / maxMes * chartH;
        return [px, py, qtd, mes];
      });
      doc.setDrawColor(245, 166, 35);
      doc.setLineWidth(0.8);
      for (let i = 0; i < pontos.length - 1; i++) {
        doc.line(pontos[i][0], pontos[i][1], pontos[i + 1][0], pontos[i + 1][1]);
      }
      pontos.forEach(([px, py, qtd, mes]) => {
        doc.setFillColor(245, 166, 35);
        doc.circle(px, py, 1.6, "F");
        tx(qtd, px, py - 3, 7, true, [245, 166, 35], "center");
        const [yr, m] = mes.split("-");
        tx(`${m}/${yr.slice(2)}`, px, baseY + 6, 7, false, [100, 100, 100], "center");
      });
      y = baseY + 14;
    }

    // ── RESUMO DE PENDÊNCIAS ──
    const atrasadosLista = registros.filter(r => {
      if (r.concluido === "SIM") return false;
      const occ = r.dataOcorrido ? new Date(r.dataOcorrido + 'T12:00:00') : null;
      const dias = occ ? Math.max(0, Math.floor((hoje - occ) / 86400000)) : 0;
      if (dias > 7) return true;
      if (r.prazo && new Date(r.prazo + 'T23:59:59') < hoje) return true;
      return false;
    }).slice().sort((a, b) => (a.dataOcorrido || "").localeCompare(b.dataOcorrido || ""));
    if (atrasadosLista.length > 0) {
      quebraPagina(240);
      rc(margin, y, col, 8, [240, 244, 248]);
      tx("REGISTROS EM ATRASO", margin + 2, y + 5.5, 8, true, [231, 76, 60]);
      y += 12;
      const linhas = atrasadosLista.slice(0, 12);
      linhas.forEach((r, i) => {
        if (y > 278) {
          doc.addPage();
          y = 20;
        }
        const occ = r.dataOcorrido ? new Date(r.dataOcorrido + 'T12:00:00') : null;
        const dias = occ ? Math.max(0, Math.floor((hoje - occ) / 86400000)) : null;
        const prazoEstourado = r.prazo && new Date(r.prazo + 'T23:59:59') < hoje;
        const cor = prazoEstourado ? [192, 57, 43] : [230, 126, 34];
        doc.setFillColor(...cor);
        doc.rect(margin, y, 2, 8, "F");
        tx(`${(r.dataOcorrido || "").split("-").reverse().join("/")}`, margin + 5, y + 5.5, 8, true, cor);
        tx(`${dias !== null ? dias + "d" : ""}`, margin + 5 + 15, y + 5.5, 8, true, [100, 100, 100]);
        const desc = (r.descricao || "").split("\n").join(" ").replace(/\s+/g, " ").trim();
        tx(desc.length > 100 ? desc.slice(0, 99) + "…" : desc, margin + 5 + 28, y + 5.5, 8, false, [60, 60, 60]);
        y += 9;
      });
      y += 4;
    }
    if (recs > 0 || diasEmAberto > 0) {
      rc(margin, y, col, 8, [240, 244, 248]);
      tx("RECONHECIMENTOS E PENDÊNCIAS", margin + 2, y + 5.5, 8, true, [100, 120, 140]);
      y += 12;
      tx(`Reconhecimentos no período: ${recs}`, margin, y, 9, false, [60, 60, 60]);
      tx(`Média de dias em aberto (pendentes): ${diasEmAberto}`, margin + 80, y, 9, false, [60, 60, 60]);
      y += 10;
    }

    // ── RODAPÉ ──
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 287, W - margin, 287);
    tx(`Gerado em ${new Date().toLocaleString("pt-BR")}`, margin, 292, 7, false, [150, 150, 150]);
    tx("BDR — Segurança do Trabalho", W - margin, 292, 7, false, [150, 150, 150], "right");
    doc.save(`Dashboard_RDR_${hojeKey}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar PDF Dashboard:", err);
    alert("Erro ao gerar PDF: " + (err?.message || err));
  }
}
