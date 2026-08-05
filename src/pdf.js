// ── PDF ──
async function gerarPDF(form, autorNome) {
  try {
    await carregarJsPDF();
  } catch (e) {}
  const jsPDF = getJsPDF();
  if (!jsPDF) {
    alert("PDF não disponível. Verifique sua conexão.");
    return;
  }
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  const W = 210,
    margin = 18,
    col = W - margin * 2;
  let y = 18;
  const ln = (x1, y1, x2, y2, c = [180, 180, 180]) => {
    doc.setDrawColor(...c);
    doc.line(x1, y1, x2, y2);
  };
  const rc = (x, yy, w, h, f = [245, 245, 245]) => {
    doc.setFillColor(...f);
    doc.rect(x, yy, w, h, "F");
  };
  const tx = (t, x, yy, b = false, c = [30, 30, 30]) => {
    doc.setFontSize(9);
    doc.setFont("Arial", b ? "bold" : "normal");
    doc.setTextColor(...c);
    const txt = String(t || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/g, "");
    doc.text(txt, x, yy);
  };
  const fd = d => {
    if (!d) return "—";
    const [yr, m, dd] = d.split("-");
    return `${dd}/${m}/${yr}`;
  };
  const PAG_MAX_Y = 277;
  const boxTexto = (lines, yIni) => {
    let yy = yIni;
    let restantes = [...lines];
    while (restantes.length) {
      const cabem = Math.max(1, Math.floor((PAG_MAX_Y - yy - 4) / 4));
      const bloco = restantes.slice(0, cabem);
      restantes = restantes.slice(cabem);
      const h = Math.max(bloco.length * 4 + 4, 14);
      doc.setDrawColor(220, 220, 220);
      doc.rect(margin + 2, yy, col - 4, h);
      bloco.forEach((l, i) => tx(l, margin + 2, yy + 4 + i * 4));
      yy += h + 8;
      if (restantes.length) {
        doc.addPage();
        yy = 20;
      }
    }
    return yy;
  };
  rc(margin, y - 6, col, 22, [0, 0, 0]);
  tx("RDR — Registro de Desvio e Reconhecimento", margin + 4, y + 1, true, [255, 255, 255]);
  tx("Segurança do Trabalho", margin + 4, y + 7, false, [200, 200, 200]);
  if (autorNome) tx(`TST: ${autorNome}`, margin + 4, y + 13, false, [200, 200, 200]);
  try {
    doc.addImage(LOGO_SRC, "PNG", W - 93, 5, 88, 40);
  } catch (e) {}
  y += 28;
  rc(margin, y, col, 8, [240, 244, 248]);
  tx("DATA, HORARIO E LOCAL", margin + 2, y + 5.5, true, [100, 120, 140]);
  y += 10;
  const half = col / 2 - 2;
  tx("Data:", margin, y + 4, true);
  tx(fd(form.dataOcorrido), margin + 12, y + 4);
  tx("Prazo:", margin + half + 4, y + 4, true);
  tx(fd(form.prazo), margin + half + 18, y + 4);
  ln(margin, y + 6, W - margin, y + 6);
  y += 10;
  tx("Hora:", margin, y + 4, true);
  tx(form.hora || "—", margin + 14, y + 4);
  tx("Concluido:", margin + half + 4, y + 4, true);
  const sm = form.concluido === "SIM" ? "( v ) SIM   (   ) NAO" : form.concluido === "NÃO" ? "(   ) SIM   ( v ) NAO" : "(   ) SIM   (   ) NAO";
  tx(sm, margin + half + 28, y + 4);
  ln(margin, y + 6, W - margin, y + 6);
  y += 10;
  tx("Local:", margin, y + 4, true);
  tx(form.local || "—", margin + 16, y + 4);
  ln(margin, y + 6, W - margin, y + 6);
  y += 14;
  rc(margin, y, col, 8, [240, 244, 248]);
  tx("CATEGORIA DO DESVIO", margin + 2, y + 5.5, true, [100, 120, 140]);
  y += 18;
  const cw = col / 4;
  CATEGORIAS.forEach((cat, i) => {
    const ci = i % 4,
      ri = Math.floor(i / 4),
      cx = margin + ci * cw,
      cy = y + ri * 8,
      active = (form.categorias || []).includes(cat);
    doc.setDrawColor(100, 100, 100);
    doc.rect(cx, cy - 3.5, 4, 4);
    if (active) {
      doc.setFillColor(245, 166, 35);
      doc.rect(cx + 0.5, cy - 3, 3, 3, "F");
    }
    tx(cat, cx + 6, cy, active);
  });
  y += Math.ceil(CATEGORIAS.length / 4) * 8 + 12;
  ln(margin, y, W - margin, y, [220, 220, 220]);
  y += 10;
  rc(margin, y, col, 8, [240, 244, 248]);
  tx("DESCRICAO", margin + 2, y + 5.5, true, [100, 120, 140]);
  y += 11;
  const dZ = 78;
  const dP = (form.descricao || "").replace(/\r?\n/g, " ").split(" ");
  const dW = [];
  let dL = "";
  dP.forEach(w => {
    if ((dL ? dL.length + 1 : 0) + w.length > dZ) {
      if (dL) dW.push(dL);
      dL = w;
      while (dL.length > dZ) {
        dW.push(dL.slice(0, dZ));
        dL = dL.slice(dZ);
      }
    } else dL = dL ? dL + " " + w : w;
  });
  if (dL) dW.push(dL);
  y = boxTexto(dW, y);
  rc(margin, y, col, 8, [240, 244, 248]);
  tx("SUGESTAO DE CORRECAO", margin + 2, y + 5.5, true, [100, 120, 140]);
  y += 11;
  const sZ = 78;
  const sP = (form.sugestaoCorrecao || "").replace(/\r?\n/g, " ").split(" ");
  const sW = [];
  let sL = "";
  sP.forEach(w => {
    if ((sL ? sL.length + 1 : 0) + w.length > sZ) {
      if (sL) sW.push(sL);
      sL = w;
      while (sL.length > sZ) {
        sW.push(sL.slice(0, sZ));
        sL = sL.slice(sZ);
      }
    } else sL = sL ? sL + " " + w : w;
  });
  if (sL) sW.push(sL);
  y = boxTexto(sW, y);
  if (form.fotos && form.fotos.length > 0) {
    rc(margin, y, col, 8, [240, 244, 248]);
    tx("FOTOS", margin + 2, y + 5.5, true, [100, 120, 140]);
    y += 11;
    for (let i = 0; i < form.fotos.length; i++) {
      const c = i % 2,
        r = Math.floor(i / 2);
      try {
        doc.addImage(form.fotos[i].url, "JPEG", margin + c * 88, y + r * 66, 80, 60);
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin + c * 88, y + r * 66, 80, 60);
      } catch (e) {}
    }
    y += Math.ceil(form.fotos.length / 2) * 66 + 4;
  }
  if (y + 50 > 277) {
    doc.addPage();
    y = 20;
  }
  rc(margin, y, col, 8, [240, 244, 248]);
  tx("RESPONSAVEIS", margin + 2, y + 5.5, true, [100, 120, 140]);
  y += 12;
  [["Resp. Setor", form.responsavelSetor], ["Colaborador", form.nomeColaborador], ["Resp. Registro", form.responsavelRegistro]].forEach(([label, val]) => {
    tx(label + ":", margin, y, true);
    ln(margin + 30, y + 1, W - margin, y + 1, [150, 150, 150]);
    if (val) tx(val, margin + 32, y);
    y += 12;
  });
  y += 4;
  ln(margin, y, W - margin, y, [220, 220, 220]);
  y += 5;
  tx(`Gerado em ${new Date().toLocaleString("pt-BR")}`, margin, y, false, [160, 160, 160]);
  doc.save(`RDR_${fd(form.dataOcorrido).replace(/\//g, "-") || "registro"}.pdf`);
}

// ── PDF DASHBOARD COM GRÁFICOS VISUAIS ──
function getJsPDF() {
  // jsPDF UMD expõe em window.jspdf.jsPDF
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  // Fallback: alguns builds expõem diretamente em window.jsPDF
  if (window.jsPDF) return window.jsPDF;
  return null;
}
function carregarJsPDF() {
  return new Promise((resolve, reject) => {
    if (getJsPDF()) {
      resolve();
      return;
    }
    const fontes = ["https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"];
    let i = 0;
    function tentar() {
      if (i >= fontes.length) {
        reject(new Error("Falha ao carregar biblioteca de PDF"));
        return;
      }
      const s = document.createElement("script");
      s.src = fontes[i];
      s.onload = () => {
        setTimeout(() => {
          if (getJsPDF()) resolve();else {
            i++;
            tentar();
          }
        }, 100);
      };
      s.onerror = () => {
        i++;
        tentar();
      };
      document.head.appendChild(s);
    }
    tentar();
  });
}
