// ── CERTIFICADOS ──
function CertificadosScreen({
  user,
  onBack
}) {
  const [modelo, setModelo] = useState(null);
  const [erroModelo, setErroModelo] = useState('');
  const [carregandoModelo, setCarregandoModelo] = useState(false);
  const [modelos, setModelos] = useState([]);
  const [carregandoModelos, setCarregandoModelos] = useState(true);
  const [salvandoModelo, setSalvandoModelo] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [editandoModelo, setEditandoModelo] = useState(false);
  const [blocos, setBlocos] = useState([]);
  const [blocosEdit, setBlocosEdit] = useState([]);
  const [salvandoTexto, setSalvandoTexto] = useState(false);
  const [textoNomes, setTextoNomes] = useState('');
  const [textoCpfs, setTextoCpfs] = useState('');
  const [erroLista, setErroLista] = useState('');
  const [pessoas, setPessoas] = useState([]);
  const [mapeamento, setMapeamento] = useState({});
  const [gerando, setGerando] = useState(false);
  const refModelo = useRef(null);
  const refDados = useRef(null);
  const opcoes = [["nome", "Nome"], ["cpf", "CPF"], ["funcao", "Função"]];

  useEffect(function() {
    carregarModelos();
  }, []);

  async function carregarModelos() {
    setCarregandoModelos(true);
    try {
      setModelos(await listarModelos());
      setErroModelo('');
    } catch (err) {
      setErroModelo('Não foi possível carregar os modelos. Verifique a conexão.');
    } finally {
      setCarregandoModelos(false);
    }
  }

  async function selecionarModelo(path) {
    setCarregandoModelo(true);
    setErroModelo('');
    try {
      const buf = await baixarModelo(path);
      const info = await abrirModeloCertificado(buf);
      setModelo({ buffer: buf, campos: info.campos, nomeArquivo: path });
      const map = {};
      info.campos.forEach(function(c) {
        map[c] = c === 'NOME_' ? 'nome' : (c === 'CPF_' ? 'cpf' : '');
      });
      setMapeamento(map);
    } catch (err) {
      setErroModelo(err && err.message ? err.message : String(err));
    } finally {
      setCarregandoModelo(false);
    }
  }

  async function handleEnviarModelo(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const nome = window.prompt('Nome para o modelo (ex.: NR35 - Trabalho em Altura):', String(file.name).replace(/\.docx$/i, ''));
    if (!nome) {
      if (refModelo.current) refModelo.current.value = '';
      return;
    }
    setSalvandoModelo(true);
    setErroModelo('');
    try {
      const path = await salvarModelo(nome, file);
      await carregarModelos();
      await selecionarModelo(path);
    } catch (err) {
      setErroModelo(err && err.message ? err.message : String(err));
    } finally {
      setSalvandoModelo(false);
      if (refModelo.current) refModelo.current.value = '';
    }
  }

  async function handleExcluirModelo(path) {
    if (!window.confirm('Excluir este modelo?')) return;
    setExcluindo(true);
    setErroModelo('');
    try {
      await excluirModelo(path);
      if (modelo && modelo.nomeArquivo === path) {
        setModelo(null);
        setMapeamento({});
        setBlocos([]);
        setBlocosEdit([]);
        setEditandoModelo(false);
      }
      await carregarModelos();
    } catch (err) {
      setErroModelo(err && err.message ? err.message : String(err));
    } finally {
      setExcluindo(false);
    }
  }

  async function abrirEditor() {
    if (!modelo) return;
    setErroModelo('');
    setCarregandoModelo(true);
    try {
      const res = await extrairTextoModelo(modelo.buffer);
      setBlocos(res.blocos);
      setBlocosEdit(res.blocos.map(function(b) { return b.tipo === 'texto' ? b.texto : ''; }));
      setEditandoModelo(true);
    } catch (err) {
      setErroModelo(err && err.message ? err.message : String(err));
    } finally {
      setCarregandoModelo(false);
    }
  }

  function atualizarBloco(idx, texto) {
    setBlocosEdit(blocosEdit.map(function(t, i) { return i === idx ? texto : t; }));
  }

  async function salvarEditor() {
    if (!modelo) return;
    setSalvandoTexto(true);
    setErroModelo('');
    try {
      const edicoes = {};
      blocos.forEach(function(b, i) {
        if (b.tipo === 'texto') edicoes[b.indice] = blocosEdit[i];
      });
      const novoBuf = await reconstruirModelo(modelo.buffer, edicoes);
      const blob = new Blob([novoBuf], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const nome = String(modelo.nomeArquivo).replace(/\.docx$/i, '');
      await salvarModelo(nome, blob);
      setModelo(Object.assign({}, modelo, { buffer: novoBuf }));
      await carregarModelos();
      setEditandoModelo(false);
    } catch (err) {
      setErroModelo(err && err.message ? err.message : String(err));
    } finally {
      setSalvandoTexto(false);
    }
  }

  function handleParseTexto() {
    const res = parsearListaNomeCpf(textoNomes, textoCpfs);
    if (!res.ok) {
      setErroLista('Nomes (' + res.nomes + ') e CPFs (' + res.cpfs + ') em quantidades diferentes. Ajuste para gerar.');
      return;
    }
    setErroLista('');
    setPessoas(res.pessoas);
  }
  async function handleDados(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const nome = (file.name || '').toLowerCase();
      let lista;
      if (/\.(xlsx|xls)$/.test(nome)) {
        lista = await lerExcelCert(file);
      } else {
        lista = lerCsvCert(await file.text());
      }
      setPessoas(lista);
    } catch (err) {
      alert('Erro ao ler arquivo: ' + (err && err.message ? err.message : err));
    }
    e.target.value = '';
  }
  function removerPessoa(idx) {
    setPessoas(pessoas.filter(function(_, i) { return i !== idx; }));
  }
  async function handleGerar() {
    if (!modelo) { alert('Selecione um modelo primeiro.'); return; }
    if (!pessoas.length) { alert('Adicione ao menos uma pessoa.'); return; }
    setGerando(true);
    try {
      const res = await gerarCertificados(modelo.buffer, pessoas, mapeamento);
      const url = URL.createObjectURL(res.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificados.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 5000);
      try {
        const pdf = await gerarPdfCertificados(modelo.buffer, pessoas, mapeamento);
        pdf.save('certificados.pdf');
      } catch (pdfErr) {
        alert(res.total + ' certificado(s) gerado(s) em certificados.zip. Falha ao gerar o PDF: ' + (pdfErr && pdfErr.message ? pdfErr.message : pdfErr));
        return;
      }
      alert(res.total + ' certificado(s) gerado(s): certificados.zip + certificados.pdf');
    } catch (err) {
      alert('Erro ao gerar: ' + (err && err.message ? err.message : err));
    } finally {
      setGerando(false);
    }
  }
  const card = {
    background: "#111111",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14
  };
  const btnBase = {
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    cursor: "pointer",
    fontFamily: "'Oswald',sans-serif",
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#000000"
    }
  }, /*#__PURE__*/React.createElement(Header, {
    title: "CERTIFICADOS",
    subtitle: "Emissão a partir de modelo .docx",
    onBack: onBack,
    right: gerando ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#f5c518",
        fontSize: 11,
        fontFamily: "'Oswald',sans-serif",
        letterSpacing: 1
      }
    }, "GERANDO...") : null
  }), /*#__PURE__*/React.createElement("div", {
    className: "shell",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "1. Modelo .docx"), /*#__PURE__*/React.createElement("input", {
    ref: refModelo,
    type: "file",
    accept: ".docx",
    onChange: handleEnviarModelo,
    style: {
      display: "none"
    }
  }), carregandoModelos ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(255,255,255,0.5)",
      fontSize: 12,
      padding: "8px 0"
    }
  }, "CARREGANDO MODELOS...") : modelos.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(255,255,255,0.5)",
      fontSize: 12,
      padding: "8px 0"
    }
  }, "Nenhum modelo salvo ainda. Envie o primeiro abaixo.") : /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 220,
      overflowY: "auto",
      marginBottom: 10
    }
  }, modelos.map(function(m) {
    var selecionado = modelo && modelo.nomeArquivo === m.path;
    return /*#__PURE__*/React.createElement("div", {
      key: m.path,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        marginBottom: 6,
        borderRadius: 10,
        border: "1px solid " + (selecionado ? "rgba(245,197,24,0.6)" : "rgba(255,255,255,0.1)"),
        background: selecionado ? "rgba(245,197,24,0.08)" : "#0a0a0a",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => selecionarModelo(m.path),
      style: {
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: selecionado ? "#f5c518" : "#ffffff",
        fontSize: 12,
        fontWeight: 600
      }
    }, m.nome), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 11
      }
    }, Math.max(1, Math.round(m.tamanho / 1024)) + " KB")), /*#__PURE__*/React.createElement("button", {
      onClick: () => handleExcluirModelo(m.path),
      disabled: excluindo,
      style: {
        background: "none",
        border: "none",
        color: "#e74c3c",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: 4
      }
    }, /*#__PURE__*/React.createElement(TrashIcon, {
      size: 14
    })));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => refModelo.current && refModelo.current.click(),
    style: Object.assign({}, btnBase, {
      width: "100%",
      background: "rgba(192,57,43,0.15)",
      border: "1px solid rgba(192,57,43,0.4)",
      color: "#c0392b"
    })
  }, /*#__PURE__*/React.createElement(UploadIcon, null), salvandoModelo ? "SALVANDO..." : "ENVIAR NOVO MODELO"), modelo && !editandoModelo && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 11,
      color: "rgba(255,255,255,0.6)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      color: "#27ae60",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(CheckIcon, null), " ", modelo.nomeArquivo), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(255,255,255,0.4)"
    }
  }, "Campos detectados:"), /*#__PURE__*/React.createElement("button", {
    onClick: abrirEditor,
    disabled: carregandoModelo,
    style: {
      background: "rgba(245,197,24,0.15)",
      border: "1px solid rgba(245,197,24,0.4)",
      color: "#f5c518",
      borderRadius: 8,
      padding: "6px 10px",
      cursor: "pointer",
      fontFamily: "'Oswald',sans-serif",
      fontSize: 11,
      letterSpacing: 1,
      fontWeight: 600
    }
  }, "EDITAR TEXTO")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, modelo.campos.map(function(c) {
    return /*#__PURE__*/React.createElement("span", {
      key: c,
      style: {
        background: "rgba(245,197,24,0.12)",
        border: "1px solid rgba(245,197,24,0.35)",
        color: "#f5c518",
        borderRadius: 6,
        padding: "3px 8px",
        fontFamily: "monospace",
        fontSize: 11
      }
    }, c);
  }))), editandoModelo && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      border: "1px solid rgba(245,197,24,0.35)",
      borderRadius: 10,
      padding: 10,
      background: "#0a0a0a"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,0.6)",
      marginBottom: 8
    }
  }, "Marcadores ", /*#__PURE__*/React.createElement("span", {
    key: "mk",
    style: {
      fontFamily: "monospace",
      color: "#f5c518"
    }
  }, "{{CAMPO}}"), " dentro do texto são preenchidos com os dados de cada pessoa. Blocos de layout (imagens, bordas, tabelas) não são editáveis."), blocos.map(function(b, i) {
    return b.tipo === 'texto' ? /*#__PURE__*/React.createElement("textarea", {
      key: b.indice,
      value: blocosEdit[i],
      onChange: e => atualizarBloco(i, e.target.value),
      rows: 2,
      style: {
        width: "100%",
        boxSizing: "border-box",
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        color: "#ffffff",
        padding: 8,
        fontSize: 12,
        fontFamily: "monospace",
        marginBottom: 6,
        resize: "vertical"
      }
    }) : /*#__PURE__*/React.createElement("div", {
      key: b.indice,
      style: {
        padding: "8px 10px",
        marginBottom: 6,
        borderRadius: 8,
        background: "rgba(255,255,255,0.04)",
        border: "1px dashed rgba(255,255,255,0.15)",
        color: "rgba(255,255,255,0.4)",
        fontSize: 11,
        textAlign: "center"
      }
    }, "ELEMENTO DE LAYOUT — NÃO EDITÁVEL");
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: salvarEditor,
    disabled: salvandoTexto,
    style: Object.assign({}, btnBase, {
      flex: 1,
      background: "rgba(39,174,96,0.15)",
      border: "1px solid rgba(39,174,96,0.4)",
      color: "#27ae60"
    })
  }, salvandoTexto ? "SALVANDO..." : "SALVAR MODELO"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditandoModelo(false),
    disabled: salvandoTexto,
    style: Object.assign({}, btnBase, {
      flex: 1,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "#ffffff"
    })
  }, "CANCELAR"))), erroModelo && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: "flex",
      alignItems: "center",
      gap: 6,
      color: "#e74c3c",
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement(AlertCircleIcon, null), erroModelo)), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "2. Pessoas"), /*#__PURE__*/React.createElement(Field, {
    label: "Nomes (um por linha)"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: textoNomes,
    onChange: e => setTextoNomes(e.target.value),
    rows: 5,
    placeholder: "FULANO DE TAL\nBELTRANO DA SILVA\n...",
    style: {
      width: "100%",
      boxSizing: "border-box",
      background: "#0a0a0a",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: 10,
      color: "#ffffff",
      padding: 10,
      fontSize: 12,
      fontFamily: "inherit",
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement(Field, {
    label: "CPFs (um por linha, na mesma ordem dos nomes)"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: textoCpfs,
    onChange: e => setTextoCpfs(e.target.value),
    rows: 5,
    placeholder: "000.000.000-00\n111.222.333-44\n...",
    style: {
      width: "100%",
      boxSizing: "border-box",
      background: "#0a0a0a",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: 10,
      color: "#ffffff",
      padding: 10,
      fontSize: 12,
      fontFamily: "inherit",
      resize: "vertical"
    }
  })), erroLista && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: "flex",
      alignItems: "center",
      gap: 6,
      color: "#e74c3c",
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement(AlertCircleIcon, null), erroLista), /*#__PURE__*/React.createElement("button", {
    onClick: handleParseTexto,
    style: Object.assign({}, btnBase, {
      width: "100%",
      marginTop: 8,
      background: "rgba(245,197,24,0.15)",
      border: "1px solid rgba(245,197,24,0.4)",
      color: "#f5c518"
    })
  }, /*#__PURE__*/React.createElement(UsersIcon, null), "ADICIONAR DA LISTA"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Ou upload de planilha (.xlsx / .csv)"
  }, /*#__PURE__*/React.createElement("input", {
    ref: refDados,
    type: "file",
    accept: ".xlsx,.xls,.csv,.txt",
    onChange: handleDados,
    style: {
      display: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => refDados.current && refDados.current.click(),
    style: Object.assign({}, btnBase, {
      width: "100%",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "#ffffff"
    })
  }, /*#__PURE__*/React.createElement(UploadIcon, null), "ENVIAR EXCEL / CSV"))), pessoas.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      background: "#0a0a0a",
      border: "1px solid rgba(39,174,96,0.3)",
      borderRadius: 10,
      padding: 10,
      maxHeight: 220,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 11,
      color: "#27ae60",
      letterSpacing: 1,
      marginBottom: 8
    }
  }, pessoas.length + " pessoa(s)"), pessoas.map(function(p, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        color: "#ffffff",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, p.nome), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "rgba(255,255,255,0.45)",
        fontFamily: "monospace"
      }
    }, p.cpf), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "rgba(255,255,255,0.35)",
        width: 90,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, p.funcao), /*#__PURE__*/React.createElement("button", {
      onClick: () => removerPessoa(idx),
      style: {
        background: "none",
        border: "none",
        color: "#e74c3c",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: 4
      }
    }, /*#__PURE__*/React.createElement(TrashIcon, {
      size: 14
    })));
  }))), modelo && /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "3. Mapear campos do modelo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, modelo.campos.map(function(c) {
    return /*#__PURE__*/React.createElement("div", {
      key: c,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#f5c518",
        width: 90,
        flexShrink: 0
      }
    }, c), /*#__PURE__*/React.createElement("select", {
      value: mapeamento[c] || '',
      onChange: e => setMapeamento(Object.assign({}, mapeamento, { [c]: e.target.value })),
      style: {
        flex: 1,
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        color: "#ffffff",
        padding: "8px 10px",
        fontSize: 12,
        fontFamily: "inherit"
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "— em branco —"), opcoes.map(function(o) {
      return /*#__PURE__*/React.createElement("option", {
        key: o[0],
        value: o[0]
      }, o[1]);
    })));
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: handleGerar,
    disabled: gerando || !modelo || !pessoas.length,
    style: Object.assign({}, btnBase, {
      width: "100%",
      marginTop: 4,
      background: gerando ? "rgba(245,197,24,0.4)" : "linear-gradient(135deg,#c0392b,#96281b)",
      color: "#ffffff",
      boxShadow: "0 8px 32px rgba(192,57,43,0.4)",
      opacity: (!modelo || !pessoas.length) && !gerando ? 0.5 : 1
    })
  }, /*#__PURE__*/React.createElement(DownloadIcon, null), gerando ? "GERANDO..." : "GERAR CERTIFICADOS (.ZIP + PDF)")));
}
