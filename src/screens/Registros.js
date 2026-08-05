// ── REGISTROS ──
function FiltroChips({
  label,
  opcoes,
  valor,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 10,
      letterSpacing: 2,
      color: "rgba(41,128,185,0.6)",
      textTransform: "uppercase",
      marginBottom: 8
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      overflowX: "auto",
      paddingBottom: 4
    }
  }, opcoes.map(op => {
    const a = valor === op.id;
    return /*#__PURE__*/React.createElement("button", {
      key: op.id,
      onClick: () => onChange(op.id),
      style: {
        flexShrink: 0,
        background: a ? "#2980b9" : "#111111",
        border: `1px solid ${a ? "#f5c518" : "rgba(255,255,255,0.1)"}`,
        color: a ? "#000000" : "#ffffff",
        fontFamily: "'Oswald',sans-serif",
        fontSize: 12,
        padding: "6px 14px",
        borderRadius: 20,
        cursor: "pointer",
        letterSpacing: 1,
        whiteSpace: "nowrap"
      }
    }, op.label);
  })));
}
function RegistrosScreen({
  user,
  onBack,
  onView,
  filtroInicial = {},
  periodo = null,
  modoSimples = false
}) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [confirmDel, setConfirmDel] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [filtroTecnico, setFiltroTecnico] = useState(filtroInicial.tecnico || 'todos');
  const [filtroCategoria, setFiltroCategoria] = useState(filtroInicial.categoria || 'todas');
  const [filtroData, setFiltroData] = useState(periodo || (filtroInicial.mesExato ? 'mesExato' : filtroInicial.data || 'todas'));
  const [filtroConcluido, setFiltroConcluido] = useState(filtroInicial.concluido || 'todos');
  const [filtroMes, setFiltroMes] = useState(filtroInicial.mesExato || '');
  const [busca, setBusca] = useState('');
  const [showFiltros, setShowFiltros] = useState(!modoSimples && Object.keys(filtroInicial).length > 0);
  const hojeKey = new Date().toLocaleDateString('en-CA');
  const ontemKey = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
  const semanaKey = new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-CA');
  const mesKey = hojeKey.slice(0, 7);
  useEffect(() => {
    let unsubscribeRecords;
    let unsubscribeUsers;
    unsubscribeRecords = fsdb.subscribeRecords(dados => {
      setRegistros(dados);
      setLoading(false);
    }, ROLES_SOMENTE_PROPRIOS.includes(user.role) ? user.id : null);
    if (user.role === 'gestor') {
      unsubscribeUsers = fsdb.subscribeUsers(dados => setTecnicos(dados.filter(u => u.role === 'tecnico' || u.role === 'gestorobra')));
    }
    return () => {
      unsubscribeRecords && unsubscribeRecords();
      unsubscribeUsers && unsubscribeUsers();
    };
  }, []);
  const filtrados = useMemo(() => registros.filter(r => {
    if (filtroTecnico !== 'todos' && r.autorId !== filtroTecnico) return false;
    if (filtroCategoria !== 'todas' && (!r.categorias || !r.categorias.includes(filtroCategoria))) return false;
    if (filtroData === 'hoje' && r.dataOcorrido !== hojeKey) return false;
    if (filtroData === 'ontem' && r.dataOcorrido !== ontemKey) return false;
    if (filtroData === 'semana' && (!r.dataOcorrido || r.dataOcorrido < semanaKey)) return false;
    if (filtroData === 'mes' && (!r.dataOcorrido || r.dataOcorrido.slice(0, 7) !== mesKey)) return false;
    if (filtroData === 'mesExato' && filtroMes && (!r.dataOcorrido || r.dataOcorrido.slice(0, 7) !== filtroMes)) return false;
    if (filtroConcluido === 'SIM' && r.concluido !== 'SIM') return false;
    if (filtroConcluido === 'NÃO' && r.concluido !== 'NÃO') return false;
    if (busca.trim()) {
      const t = busca.trim().toLowerCase();
      const alvo = [r.descricao, r.local, r.nomeColaborador, r.autorNome, r.responsavelSetor, r.responsavelRegistro, r.hora, (r.categorias || []).join(' ')].join(' ').toLowerCase();
      if (!alvo.includes(t)) return false;
    }
    return true;
  }), [registros, filtroTecnico, filtroCategoria, filtroData, filtroMes, filtroConcluido, busca, hojeKey, ontemKey, semanaKey, mesKey]);
  const filtrosAtivos = [filtroTecnico !== 'todos', filtroCategoria !== 'todas', filtroData !== 'todas', filtroConcluido !== 'todos', filtroMes !== '', busca.trim() !== ''].filter(Boolean).length;
  const grouped = useMemo(() => filtrados.reduce((acc, r) => {
    const k = r.dataOcorrido || "sem-data";
    if (!acc[k]) acc[k] = [];
    acc[k].push(r);
    return acc;
  }, {}), [filtrados]);
  const days = useMemo(() => Object.keys(grouped).sort((a, b) => b.localeCompare(a)), [grouped]);
  async function handleDelete(id) {
    await fsdb.deleteRecord(id);
    setRegistros(r => r.filter(x => x.id !== id));
    setConfirmDel(null);
  }
  function fmtDay(key) {
    if (key === "sem-data") return "Sem data";
    const [yr, m, d] = key.split("-");
    const date = new Date(+yr, +m - 1, +d);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    if (date.toDateString() === hoje.toDateString()) return "Hoje";
    if (date.toDateString() === ontem.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }
  function statusDoRegistro(r) {
    if (r.concluido === "SIM") return { tipo: "concluido", dias: 0, atrasado: false };
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let dias = 0;
    if (r.dataOcorrido) {
      const ocorrido = new Date(r.dataOcorrido + "T12:00:00");
      dias = Math.max(0, Math.floor((hoje - ocorrido) / (1000 * 60 * 60 * 24)));
    }
    let atrasado = dias > 7;
    if (r.prazo) {
      const prazo = new Date(r.prazo + "T23:59:59");
      if (prazo < hoje) atrasado = true;
    }
    return { tipo: "pendente", dias, atrasado };
  }
  const opsDatas = [{
    id: 'todas',
    label: 'Todas'
  }, {
    id: 'hoje',
    label: 'Hoje'
  }, {
    id: 'ontem',
    label: 'Ontem'
  }, {
    id: 'semana',
    label: '7 dias'
  }, {
    id: 'mes',
    label: 'Este mês'
  }, {
    id: 'mesExato',
    label: 'Mês específico'
  }];
  const opsCats = [{
    id: 'todas',
    label: 'Todas'
  }, ...CATEGORIAS.map(c => ({
    id: c,
    label: c
  }))];
  const opsTecs = [{
    id: 'todos',
    label: 'Todos'
  }, ...tecnicos.map(u => ({
    id: u.id,
    label: u.nome
  }))];
  const mesesPT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const mesesPTShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const anosDisponiveis = useMemo(() => [...new Set(registros.map(r => r.dataOcorrido?.slice(0, 4)).filter(Boolean))].sort().reverse(), [registros]);
  const [anoExpandido, setAnoExpandido] = useState(null);
  const contagemAno = useMemo(() => {
    const m = {};
    registros.forEach(r => {
      const a = r.dataOcorrido?.slice(0, 4);
      if (a) m[a] = (m[a] || 0) + 1;
    });
    return m;
  }, [registros]);
  const contagemMes = useMemo(() => {
    const m = {};
    registros.forEach(r => {
      const k = r.dataOcorrido?.slice(0, 7);
      if (k) m[k] = (m[k] || 0) + 1;
    });
    return m;
  }, [registros]);
  const mesAtivoFiltro = filtroData === 'mesExato' && filtroMes ? filtroMes : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#000000",
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement(Header, {
    title: ROLES_SOMENTE_PROPRIOS.includes(user.role) ? "MEUS REGISTROS" : "REGISTROS",
    subtitle: `${filtrados.length} de ${registros.length} registros`,
    onBack: onBack,
    right: !modoSimples && /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowFiltros(f => !f),
      style: {
        position: "relative",
        background: showFiltros ? "#2980b9" : "#111111",
        border: `1px solid ${showFiltros ? "#f5c518" : "rgba(255,255,255,0.15)"}`,
        color: showFiltros ? "#000000" : "#ffffff",
        fontFamily: "'Oswald',sans-serif",
        fontSize: 12,
        padding: "7px 12px",
        borderRadius: 8,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(FilterIcon, null), "FILTROS", filtrosAtivos > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: -6,
        right: -6,
        background: "#3498db",
        color: "white",
        borderRadius: "50%",
        width: 16,
        height: 16,
        fontSize: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, filtrosAtivos))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 12,
      color: "rgba(245,166,35,0.55)",
      display: "flex",
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement(SearchIcon, null)), /*#__PURE__*/React.createElement("input", {
    value: busca,
    onChange: e => setBusca(e.target.value),
    placeholder: "Buscar por descrição, local, colaborador, TST...",
    style: {
      width: "100%",
      background: "#111111",
      border: "1px solid rgba(245,166,35,0.2)",
      borderRadius: 10,
      padding: "10px 36px 10px 36px",
      color: "#e8dcc8",
      fontSize: 13,
      outline: "none"
    }
  }), busca && /*#__PURE__*/React.createElement("button", {
    onClick: () => setBusca(''),
    style: {
      position: "absolute",
      right: 8,
      background: "rgba(192,57,43,0.15)",
      border: "1px solid rgba(192,57,43,0.3)",
      color: "#e74c3c",
      borderRadius: 6,
      width: 24,
      height: 24,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 11
  })))), showFiltros && !modoSimples && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(0,0,0,0.8)",
      borderBottom: "1px solid rgba(245,166,35,0.15)",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement(FiltroChips, {
    label: "Por Data",
    opcoes: opsDatas,
    valor: filtroData,
    onChange: v => {
      setFiltroData(v);
      if (v !== 'mesExato') setFiltroMes('');
    }
  }), filtroData === 'mesExato' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 10,
      letterSpacing: 2,
      color: "rgba(41,128,185,0.6)",
      textTransform: "uppercase",
      marginBottom: 8
    }
  }, "Selecione o m\xEAs"), /*#__PURE__*/React.createElement("input", {
    type: "month",
    value: filtroMes,
    onChange: e => setFiltroMes(e.target.value),
    style: {
      maxWidth: 200
    }
  })), /*#__PURE__*/React.createElement(FiltroChips, {
    label: "Por Categoria",
    opcoes: opsCats,
    valor: filtroCategoria,
    onChange: setFiltroCategoria
  }), !ROLES_SOMENTE_PROPRIOS.includes(user.role) && /*#__PURE__*/React.createElement(FiltroChips, {
    label: "Por TST",
    opcoes: opsTecs,
    valor: filtroTecnico,
    onChange: setFiltroTecnico
  }), filtrosAtivos > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setFiltroTecnico('todos');
      setFiltroCategoria('todas');
      setFiltroData('todas');
      setFiltroMes('');
      setBusca('');
    },
    style: {
      background: "transparent",
      border: "1px solid rgba(41,128,185,0.4)",
      color: "#3498db",
      fontFamily: "'Oswald',sans-serif",
      fontSize: 11,
      padding: "6px 14px",
      borderRadius: 20,
      cursor: "pointer",
      letterSpacing: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(FilterIcon, {
    size: 12
  }), "LIMPAR FILTROS")), loading ? /*#__PURE__*/React.createElement(Spinner, null) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      maxWidth: 600,
      margin: "0 auto"
    }
  }, anosDisponiveis.map(ano => {
    const expandido = anoExpandido === ano;
    const totalAno = contagemAno[ano] || 0;
    return /*#__PURE__*/React.createElement("div", {
      key: ano,
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setAnoExpandido(expandido ? null : ano),
      style: {
        width: "100%",
        background: "rgba(41,128,185,0.12)",
        border: "1px solid rgba(245,166,35,0.15)",
        borderRadius: expandido ? "10px 10px 0 0" : "10px",
        padding: "12px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#f5c518",
        fontSize: 16
      }
    }, /*#__PURE__*/React.createElement(CalendarIcon, {
      size: 18
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Oswald',sans-serif",
        fontSize: 16,
        color: "#ffffff",
        letterSpacing: 1,
        textAlign: "left",
        fontWeight: 700
      }
    }, ano))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: "rgba(41,128,185,0.2)",
        color: "#f5c518",
        fontFamily: "'Oswald',sans-serif",
        fontWeight: 700,
        fontSize: 12,
        borderRadius: 20,
        padding: "2px 10px"
      }
    }, totalAno), expandido ? /*#__PURE__*/React.createElement(ChevronDown, null) : /*#__PURE__*/React.createElement(ChevronRight, null))), expandido && /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid rgba(245,166,35,0.15)",
        borderTop: "none",
        borderRadius: "0 0 10px 10px",
        padding: "10px 12px",
        background: "#0a0a0a"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(6,1fr)",
        gap: 4
      }
    }, mesesPTShort.map((nome, i) => {
      const mesNum = String(i + 1).padStart(2, '0');
      const totalMes = contagemMes[ano + '-' + mesNum] || 0;
      const ativo = mesAtivoFiltro === `${ano}-${mesNum}`;
      return /*#__PURE__*/React.createElement("button", {
        key: mesNum,
        onClick: () => {
          setFiltroData('mesExato');
          setFiltroMes(`${ano}-${mesNum}`);
        },
        style: {
          background: ativo ? "#2980b9" : totalMes > 0 ? "rgba(245,166,35,0.08)" : "transparent",
          border: `1px solid ${ativo ? "#f5c518" : totalMes > 0 ? "rgba(245,166,35,0.2)" : "rgba(255,255,255,0.06)"}`,
          color: ativo ? "#000" : totalMes > 0 ? "#f5c518" : "rgba(255,255,255,0.2)",
          fontFamily: "'Oswald',sans-serif",
          fontSize: 10,
          letterSpacing: 0.5,
          padding: "8px 0",
          borderRadius: 6,
          cursor: totalMes > 0 || ativo ? "pointer" : "default",
          fontWeight: ativo ? 700 : 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement("span", null, nome), totalMes > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 8,
          opacity: 0.6
        }
      }, totalMes));
    }))));
  }), (mesAtivoFiltro || busca.trim()) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, days.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px 20px",
      color: "rgba(255,255,255,0.3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(FolderIcon, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 2,
      fontSize: 13
    }
  }, busca.trim() ? "NENHUM REGISTRO ENCONTRADO" : "NENHUM REGISTRO NESTE M\xCAS")), days.map(day => /*#__PURE__*/React.createElement("div", {
    key: day,
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setExpanded(e => ({
      ...e,
      [day]: !e[day]
    })),
    style: {
      width: "100%",
      background: "rgba(41,128,185,0.15)",
      border: "1px solid rgba(245,166,35,0.15)",
      borderRadius: expanded[day] ? "10px 10px 0 0" : "10px",
      padding: "12px 16px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#f5c518"
    }
  }, /*#__PURE__*/React.createElement(CalendarIcon, null)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      color: "#ffffff",
      letterSpacing: 1,
      textAlign: "left",
      textTransform: "capitalize"
    }
  }, fmtDay(day)), day !== "sem-data" && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "rgba(255,255,255,0.4)",
      fontFamily: "'Oswald',sans-serif"
    }
  }, day.split("-").reverse().join("/")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: "rgba(41,128,185,0.2)",
      color: "#f5c518",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 12,
      borderRadius: 20,
      padding: "2px 10px"
    }
  }, grouped[day].length), expanded[day] ? /*#__PURE__*/React.createElement(ChevronDown, null) : /*#__PURE__*/React.createElement(ChevronRight, null))), expanded[day] && /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid rgba(245,166,35,0.15)",
      borderTop: "none",
      borderRadius: "0 0 10px 10px",
      overflow: "hidden"
    }
  }, grouped[day].map((r, idx) => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      background: idx % 2 === 0 ? "#0d0d0d" : "transparent",
      borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, !ROLES_SOMENTE_PROPRIOS.includes(user.role) && r.autorNome && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#f5c518",
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1,
      marginBottom: 5,
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(UserIcon, null), r.autorNome), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 4,
      marginBottom: 6
    }
  }, (r.categorias || []).slice(0, 3).map(cat => /*#__PURE__*/React.createElement("span", {
    key: cat,
    style: {
      fontSize: 10,
      background: "rgba(41,128,185,0.2)",
      color: "#f5c518",
      border: "1px solid rgba(245,166,35,0.25)",
      borderRadius: 10,
      padding: "2px 7px",
      fontFamily: "'Oswald',sans-serif"
    }
  }, cat)), (r.categorias || []).length > 3 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "rgba(255,255,255,0.4)"
    }
  }, "+", r.categorias.length - 3)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 6
    }
  }, (() => {
    const st = statusDoRegistro(r);
    if (st.tipo === "concluido") return /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        background: "rgba(39,174,96,0.15)",
        color: "#27ae60",
        border: "1px solid rgba(39,174,96,0.3)",
        borderRadius: 10,
        padding: "2px 8px",
        fontFamily: "'Oswald',sans-serif",
        letterSpacing: 1,
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(CheckIcon, {
      size: 10
    }), "CONCLU\xCDDO");
    return [/*#__PURE__*/React.createElement("span", {
      key: "pend",
      style: {
        fontSize: 10,
        background: "rgba(245,166,35,0.12)",
        color: "#f5c518",
        border: "1px solid rgba(245,166,35,0.3)",
        borderRadius: 10,
        padding: "2px 8px",
        fontFamily: "'Oswald',sans-serif",
        letterSpacing: 1,
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, "PENDENTE"), st.dias > 0 && /*#__PURE__*/React.createElement("span", {
      key: "dias",
      style: {
        fontSize: 10,
        background: "rgba(52,152,219,0.15)",
        color: "#3498db",
        border: "1px solid rgba(52,152,219,0.3)",
        borderRadius: 10,
        padding: "2px 8px",
        fontFamily: "'Oswald',sans-serif",
        letterSpacing: 0.5
      }
    }, st.dias, " ", st.dias === 1 ? "dia" : "dias", " em aberto"), st.atrasado && /*#__PURE__*/React.createElement("span", {
      key: "atraso",
      style: {
        fontSize: 10,
        background: "rgba(231,76,60,0.15)",
        color: "#e74c3c",
        border: "1px solid rgba(231,76,60,0.35)",
        borderRadius: 10,
        padding: "2px 8px",
        fontFamily: "'Oswald',sans-serif",
        letterSpacing: 1,
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(AlertIcon, {
      size: 10
    }), "ATRASADO")];
  })()), r.local && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,0.5)",
      marginBottom: 3
    }
  }, "\uD83D\uDCCD ", r.local), r.descricao && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "rgba(232,220,200,0.7)",
      lineHeight: 1.4
    }
  }, r.descricao.slice(0, 80), r.descricao.length > 80 ? "..." : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "rgba(232,220,200,0.35)",
      fontFamily: "'Oswald',sans-serif",
      marginTop: 4
    }
  }, r.hora, r.nomeColaborador && ` • ${r.nomeColaborador}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginLeft: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onView(r),
    style: {
      background: "rgba(41,128,185,0.15)",
      border: "1px solid rgba(245,166,35,0.2)",
      color: "#f5c518",
      borderRadius: 8,
      padding: "6px 10px",
      cursor: "pointer",
      fontSize: 10,
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(EyeIcon, {
    size: 13
  }), "VER"), user.role === 'gestor' && /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmDel(r.id),
    style: {
      background: "rgba(41,128,185,0.15)",
      border: "1px solid rgba(41,128,185,0.2)",
      color: "#3498db",
      borderRadius: 8,
      padding: "6px 8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(TrashIcon, null))))))))))), confirmDel && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.92)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 200,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#111111",
      border: "1px solid rgba(245,166,35,0.2)",
      borderRadius: 16,
      padding: 24,
      maxWidth: 300,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 16,
      color: "#ffffff",
      letterSpacing: 1,
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(AlertIcon, null), "EXCLUIR REGISTRO?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,0.5)",
      marginBottom: 20
    }
  }, "Esta a\xE7\xE3o n\xE3o pode ser desfeita."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmDel(null),
    style: {
      flex: 1,
      background: "transparent",
      border: "1px solid rgba(232,220,200,0.2)",
      color: "rgba(255,255,255,0.6)",
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: "10px",
      borderRadius: 8,
      cursor: "pointer",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 12
  }), "CANCELAR"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDelete(confirmDel),
    style: {
      flex: 1,
      background: "rgba(41,128,185,0.8)",
      border: "none",
      color: "white",
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: "10px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(TrashIcon, {
    size: 14
  }), "EXCLUIR")))));
}
