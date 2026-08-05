// ── FORM ──
const initialForm = {
  dataOcorrido: "",
  prazo: "",
  hora: "",
  concluido: "",
  local: "",
  categorias: [],
  descricao: "",
  sugestaoCorrecao: "",
  responsavelSetor: "",
  nomeColaborador: "",
  responsavelRegistro: "",
  fotos: []
};
function FormScreen({
  user,
  onBack,
  onSaved,
  editData
}) {
  const [form, setForm] = useState(editData || {
    ...initialForm,
    dataOcorrido: new Date().toLocaleDateString('en-CA'),
    hora: new Date().toTimeString().slice(0, 5)
  });
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef();
  const hc = e => {
    const {
      name,
      value
    } = e.target;
    setForm(f => ({
      ...f,
      [name]: value
    }));
  };
  const toggleCat = cat => setForm(f => ({
    ...f,
    categorias: (f.categorias || []).includes(cat) ? (f.categorias || []).filter(c => c !== cat) : [...(f.categorias || []), cat]
  }));
  function comprimirImagem(file, maxWidth = 800, qualidade = 0.6) {
    return new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width,
            h = img.height;
          if (w > maxWidth) {
            h = Math.round(h * maxWidth / w);
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          res({
            url: canvas.toDataURL('image/jpeg', qualidade),
            name: file.name
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function handleFotos(e) {
    const files = Array.from(e.target.files);
    if ((form.fotos || []).length >= 4) return;
    const toAdd = files.slice(0, 4 - (form.fotos || []).length);
    Promise.all(toAdd.map(file => comprimirImagem(file))).then(imgs => setForm(f => ({
      ...f,
      fotos: [...(f.fotos || []), ...imgs]
    })));
  }
  function removePhoto(i) {
    setForm(f => ({
      ...f,
      fotos: (f.fotos || []).filter((_, idx) => idx !== i)
    }));
  }
  async function handleSave() {
    if (user.role !== 'gestor' && editData) return;
    if (!form.dataOcorrido || !form.dataOcorrido.trim()) {
      alert('Informe a data do ocorrido para salvar.');
      return;
    }
    if (!form.descricao || !form.descricao.trim()) {
      alert('Informe a descrição do desvio para salvar.');
      return;
    }
    setSalvando(true);
    try {
      const rec = {
        ...form,
        autorId: editData?.autorId || user.id,
        autorNome: editData?.autorNome || user.nome
      };
      if (editData?.id) rec.id = editData.id;
      if (editData?.id) rec._exists = true;
      await fsdb.saveRecord(rec);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onSaved();
      }, 1200);
    } catch (e) {
      alert('Erro ao salvar. Verifique a conexão.');
    }
    setSalvando(false);
  }
  async function handlePDF() {
    setGenerating(true);
    try {
      await gerarPDF(form, user.nome);
    } catch (e) {
      alert("Erro ao gerar PDF.");
    }
    setGenerating(false);
  }
  const readOnly = user.role !== 'gestor' && editData !== null;
  const card = {
    background: "#111111",
    border: "1px solid rgba(245,166,35,0.12)",
    borderRadius: 12,
    padding: "18px 16px",
    marginBottom: 14
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#000000",
      paddingBottom: 40,
      color: "#ffffff"
    }
  }, /*#__PURE__*/React.createElement(Header, {
    title: readOnly ? "VISUALIZAR RDR" : editData ? "EDITAR RDR" : "NOVO RDR",
    subtitle: ROLE_LABELS[user.role] || user.role,
    onBack: onBack,
    right: /*#__PURE__*/React.createElement("button", {
      onClick: () => setPreview(p => !p),
      style: {
        background: preview ? "#c0392b" : "rgba(192,57,43,0.15)",
        border: "1px solid rgba(245,166,35,0.4)",
        color: preview ? "#000000" : "#f5c518",
        fontFamily: "'Oswald',sans-serif",
        fontWeight: 600,
        fontSize: 12,
        padding: "7px 14px",
        borderRadius: 6,
        cursor: "pointer",
        letterSpacing: 1,
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, preview ? /*#__PURE__*/React.createElement(EditIcon, {
      size: 12
    }) : /*#__PURE__*/React.createElement(EyeIcon, {
      size: 13
    }), preview ? "EDITAR" : "PRÉVIA")
  }), !preview ? /*#__PURE__*/React.createElement("div", {
    className: "shell",
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Data e Hor\xE1rio"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Data do Ocorrido"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    name: "dataOcorrido",
    value: form.dataOcorrido,
    onChange: hc,
    readOnly: readOnly
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Prazo"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    name: "prazo",
    value: form.prazo,
    onChange: hc,
    readOnly: readOnly
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Hora"
  }, /*#__PURE__*/React.createElement("input", {
    type: "time",
    name: "hora",
    value: form.hora,
    onChange: hc,
    readOnly: readOnly
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Conclu\xEDdo"
  }, /*#__PURE__*/React.createElement("select", {
    name: "concluido",
    value: form.concluido,
    onChange: hc,
    disabled: readOnly
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), /*#__PURE__*/React.createElement("option", {
    value: "SIM"
  }, "SIM"), /*#__PURE__*/React.createElement("option", {
    value: "N\xC3O"
  }, "N\xC3O")))), /*#__PURE__*/React.createElement(Field, {
    label: "Local do Desvio"
  }, /*#__PURE__*/React.createElement("input", {
    name: "local",
    value: form.local || "",
    onChange: hc,
    placeholder: "Ex: Andar 3, Setor de soldagem...",
    readOnly: readOnly
  }))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Categoria do Desvio"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, CATEGORIAS.map(cat => {
    const a = (form.categorias || []).includes(cat);
    return /*#__PURE__*/React.createElement("button", {
      key: cat,
      onClick: () => toggleCat(cat),
      disabled: readOnly,
      style: {
        background: a ? "#c0392b" : "#111111",
        border: `1px solid ${a ? "#f5c518" : "rgba(192,57,43,0.2)"}`,
        color: a ? "#000000" : "#ffffff",
        fontFamily: "'Oswald',sans-serif",
        fontWeight: a ? 600 : 400,
        fontSize: 12,
        padding: "6px 12px",
        borderRadius: 20,
        cursor: readOnly ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 4,
        opacity: readOnly ? 0.7 : 1
      }
    }, a && /*#__PURE__*/React.createElement(CheckIcon, null), cat);
  }))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Detalhes"), /*#__PURE__*/React.createElement(Field, {
    label: "Descri\xE7\xE3o do Ocorrido"
  }, /*#__PURE__*/React.createElement("textarea", {
    name: "descricao",
    value: form.descricao || "",
    onChange: hc,
    placeholder: "Descreva o que aconteceu...",
    readOnly: readOnly
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Sugest\xE3o de Corre\xE7\xE3o"
  }, /*#__PURE__*/React.createElement("textarea", {
    name: "sugestaoCorrecao",
    value: form.sugestaoCorrecao || "",
    onChange: hc,
    placeholder: "Como corrigir ou evitar no futuro...",
    readOnly: readOnly
  })))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Fotos (", (form.fotos || []).length, "/4)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 10
    }
  }, (form.fotos || []).map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: "relative",
      width: 110,
      height: 82
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: f.url,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: 8,
      border: "1px solid rgba(245,166,35,0.3)"
    }
  }), !readOnly && /*#__PURE__*/React.createElement("button", {
    onClick: () => removePhoto(i),
    style: {
      position: "absolute",
      top: -7,
      right: -7,
      background: "#c0392b",
      border: "none",
      color: "white",
      borderRadius: "50%",
      width: 22,
      height: 22,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(TrashIcon, null)))), !readOnly && (form.fotos || []).length < 4 && /*#__PURE__*/React.createElement("button", {
    onClick: () => fileRef.current.click(),
    style: {
      width: 110,
      height: 82,
      background: "rgba(192,57,43,0.08)",
      border: "1.5px dashed rgba(245,166,35,0.35)",
      borderRadius: 8,
      color: "#f5c518",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      fontSize: 10,
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1
    }
  }, /*#__PURE__*/React.createElement(CameraIcon, null), "FOTO")), /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: "image/*",
    multiple: true,
    style: {
      display: readOnly ? "none" : "none"
    },
    onChange: handleFotos
  })), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Respons\xE1veis"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Respons\xE1vel pelo Setor"
  }, /*#__PURE__*/React.createElement("input", {
    name: "responsavelSetor",
    value: form.responsavelSetor || "",
    onChange: hc,
    placeholder: "Nome completo",
    readOnly: readOnly
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Nome do Colaborador"
  }, /*#__PURE__*/React.createElement("input", {
    name: "nomeColaborador",
    value: form.nomeColaborador || "",
    onChange: hc,
    placeholder: "Nome completo",
    readOnly: readOnly
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Respons\xE1vel pelo Registro"
  }, /*#__PURE__*/React.createElement("input", {
    name: "responsavelRegistro",
    value: form.responsavelRegistro || "",
    onChange: hc,
    placeholder: "Nome completo",
    readOnly: readOnly
  })))), readOnly ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      flex: 1,
      background: "transparent",
      border: "1px solid rgba(232,220,200,0.15)",
      color: "rgba(255,255,255,0.5)",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 600,
      fontSize: 13,
      padding: "14px",
      borderRadius: 10,
      cursor: "pointer",
      letterSpacing: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(BackIcon, {
    size: 16
  }), "VOLTAR"), /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: handlePDF,
    disabled: generating,
    style: {
      "--glow": "#f5c518",
      flex: 1,
      background: generating ? "rgba(100,100,100,0.4)" : "rgba(20,40,60,0.9)",
      border: "1px solid rgba(245,166,35,0.3)",
      color: generating ? "#aaa" : "#f5c518",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 13,
      padding: "14px",
      borderRadius: 10,
      cursor: "pointer",
      letterSpacing: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(DownloadIcon, null), generating ? "GERANDO..." : "EXPORTAR PDF")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      flex: 1,
      background: "transparent",
      border: "1px solid rgba(232,220,200,0.15)",
      color: "rgba(255,255,255,0.5)",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 600,
      fontSize: 13,
      padding: "14px",
      borderRadius: 10,
      cursor: "pointer",
      letterSpacing: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 12
  }), "CANCELAR"), /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: handleSave,
    disabled: salvando,
    style: {
      "--glow": "#c0392b",
      flex: 2,
      background: saved ? "rgba(39,174,96,0.85)" : salvando ? "rgba(100,100,100,0.5)" : "rgba(192,57,43,0.95)",
      border: "none",
      color: "#000000",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 15,
      padding: "14px",
      borderRadius: 10,
      cursor: "pointer",
      letterSpacing: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, saved ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CheckIcon, null), "SALVO!") : salvando ? "SALVANDO..." : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SaveIcon, {
    size: 15
  }), "SALVAR"))), /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: handlePDF,
    disabled: generating,
    style: {
      "--glow": "#f5c518",
      width: "100%",
      background: generating ? "rgba(100,100,100,0.4)" : "rgba(20,40,60,0.9)",
      border: "1px solid rgba(245,166,35,0.3)",
      color: generating ? "#aaa" : "#f5c518",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 13,
      padding: "13px",
      borderRadius: 10,
      cursor: "pointer",
      letterSpacing: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(DownloadIcon, null), generating ? "GERANDO..." : "EXPORTAR PDF"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      color: "#1a1a1a",
      borderRadius: 12,
      padding: "24px 20px",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
      borderBottom: "2px solid #1a1a1a",
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 18,
      color: "#14283c"
    }
  }, "BDR"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 12,
      marginTop: 1
    }
  }, "RDR")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 12,
      textTransform: "uppercase"
    }
  }, "Registro de Desvio"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 12
    }
  }, "e Reconhecimento")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      border: "2px solid #999",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 9,
      color: "#999"
    }
  }, "LOGO")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#666",
      marginBottom: 8
    }
  }, "TST: ", user.nome), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("b", null, "Data:"), " ", form.dataOcorrido ? new Date(form.dataOcorrido + "T12:00:00").toLocaleDateString("pt-BR") : "—", " \xA0", /*#__PURE__*/React.createElement("b", null, "Prazo:"), " ", form.prazo ? new Date(form.prazo + "T12:00:00").toLocaleDateString("pt-BR") : "—"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("b", null, "Hora:"), " ", form.hora || "—", " \xA0", /*#__PURE__*/React.createElement("b", null, "Conclu\xEDdo:"), " (", form.concluido === "SIM" ? "✓" : " ", ") SIM (", form.concluido === "NÃO" ? "✓" : " ", ") N\xC3O"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("b", null, "Local:"), " ", form.local || "—"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 4,
      marginBottom: 10
    }
  }, CATEGORIAS.map(cat => /*#__PURE__*/React.createElement("span", {
    key: cat,
    style: {
      fontSize: 11,
      marginRight: 6
    }
  }, "(", (form.categorias || []).includes(cat) ? "✓" : " ", ") ", cat))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #ddd",
      paddingTop: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 12
    }
  }, "Descri\xE7\xE3o:"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 4,
      minHeight: 40
    }
  }, form.descricao)), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #ddd",
      paddingTop: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 12
    }
  }, "Sugest\xE3o:"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 4,
      minHeight: 40
    }
  }, form.sugestaoCorrecao)), (form.fotos || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #ddd",
      paddingTop: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 12
    }
  }, "Fotos:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 6
    }
  }, form.fotos.map((f, i) => /*#__PURE__*/React.createElement("img", {
    key: i,
    src: f.url,
    alt: "",
    style: {
      width: 120,
      height: 90,
      objectFit: "cover",
      border: "1px solid #ccc",
      borderRadius: 4
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #ddd",
      paddingTop: 8
    }
  }, [["Resp. Setor", form.responsavelSetor], ["Colaborador", form.nomeColaborador], ["Resp. Registro", form.responsavelRegistro]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      fontSize: 12,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("b", null, l, ":"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      borderBottom: "1px solid #ccc",
      display: "inline-block",
      minWidth: 160
    }
  }, v))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, !readOnly && /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: handleSave,
    disabled: salvando,
    style: {
      "--glow": "#c0392b",
      flex: 1,
      background: saved ? "rgba(39,174,96,0.85)" : "rgba(192,57,43,0.95)",
      border: "none",
      color: "#000000",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 14,
      padding: "14px",
      borderRadius: 10,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, saved ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CheckIcon, null), "SALVO!") : salvando ? "..." : "SALVAR"), /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: handlePDF,
    disabled: generating,
    style: {
      "--glow": "#f5c518",
      flex: 1,
      background: generating ? "rgba(100,100,100,0.4)" : "rgba(20,40,60,0.9)",
      border: "1px solid rgba(245,166,35,0.3)",
      color: generating ? "#aaa" : "#f5c518",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 14,
      padding: "14px",
      borderRadius: 10,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(DownloadIcon, null), generating ? "..." : "PDF"))));
}
