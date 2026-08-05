// ── CERTIFICADOS ──
function CertificadosScreen({
  user,
  onBack
}) {
  const [modelo, setModelo] = useState(null);
  const [erroModelo, setErroModelo] = useState('');
  const [carregandoModelo, setCarregandoModelo] = useState(false);
  const [textoLista, setTextoLista] = useState('');
  const [pessoas, setPessoas] = useState([]);
  const [mapeamento, setMapeamento] = useState({});
  const [gerando, setGerando] = useState(false);
  const refModelo = useRef(null);
  const refDados = useRef(null);
  const opcoes = [["nome", "Nome"], ["cpf", "CPF"], ["funcao", "Função"]];

  async function handleModelo(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setCarregandoModelo(true);
    setErroModelo('');
    try {
      const buf = await file.arrayBuffer();
      const info = await abrirModeloCertificado(buf);
      setModelo({ buffer: buf, campos: info.campos, nomeArquivo: file.name });
      const map = {};
      info.campos.forEach(function(c) {
        map[c] = c === 'NOME_' ? 'nome' : (c === 'CPF_' ? 'cpf' : '');
      });
      setMapeamento(map);
    } catch (err) {
      setErroModelo(err && err.message ? err.message : String(err));
    } finally {
      setCarregandoModelo(false);
      if (refModelo.current) refModelo.current.value = '';
    }
  }
  function handleParseTexto() {
    setPessoas(parsearListaTexto(textoLista));
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
    if (!modelo) { alert('Envie o modelo .docx primeiro.'); return; }
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
      alert(res.total + ' certificado(s) gerado(s) em certificados.zip');
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
    onChange: handleModelo,
    style: {
      display: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => refModelo.current && refModelo.current.click(),
    style: Object.assign({}, btnBase, {
      width: "100%",
      background: "rgba(192,57,43,0.15)",
      border: "1px solid rgba(192,57,43,0.4)",
      color: "#c0392b"
    })
  }, /*#__PURE__*/React.createElement(UploadIcon, null), carregandoModelo ? "LENDO MODELO..." : (modelo ? "Trocar modelo" : "Enviar modelo .docx")), modelo && /*#__PURE__*/React.createElement("div", {
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
      marginBottom: 4,
      color: "rgba(255,255,255,0.4)"
    }
  }, "Campos detectados no modelo:"), /*#__PURE__*/React.createElement("div", {
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
  }))), erroModelo && /*#__PURE__*/React.createElement("div", {
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
    label: "Colar lista (nome / CPF / função)"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: textoLista,
    onChange: e => setTextoLista(e.target.value),
    rows: 6,
    placeholder: "FULANO DE TAL\t000.000.000-00\tPEDREIRO\n...",
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
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleParseTexto,
    style: Object.assign({}, btnBase, {
      width: "100%",
      marginTop: 8,
      background: "rgba(245,197,24,0.15)",
      border: "1px solid rgba(245,197,24,0.4)",
      color: "#f5c518"
    })
  }, /*#__PURE__*/React.createElement(UsersIcon, null), "ADICIONAR DA LISTA")), /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement(DownloadIcon, null), gerando ? "GERANDO..." : "GERAR CERTIFICADOS (.ZIP)")));
}
