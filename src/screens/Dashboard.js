// ── DASHBOARD ──
function StatCard({
  label,
  val,
  cor,
  icon,
  onClick,
  delta
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: onClick,
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
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start"
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
  }, label), delta === null || delta === undefined ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,0.2)",
      marginTop: 4
    }
  }, "—") : /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      fontSize: 11,
      fontWeight: 700,
      fontFamily: "'Oswald',sans-serif",
      color: delta > 0 ? "#27ae60" : delta < 0 ? "#e74c3c" : "rgba(255,255,255,0.4)",
      marginTop: 4
    }
  }, delta > 0 ? /*#__PURE__*/React.createElement(ArrowUpIcon, {
    size: 10
  }) : delta < 0 ? /*#__PURE__*/React.createElement(ArrowDownIcon, {
    size: 10
  }) : null, delta > 0 ? `+${delta}%` : `${delta}%`, " vs ant."), onClick && /*#__PURE__*/React.createElement("div", {
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
  }, "\u2192")));
}
function DashboardScreen({
  onBack,
  onVerRegistros
}) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const [chartErr, setChartErr] = useState(false);
  const [periodo, setPeriodo] = useState('mes');
  const [customInicio, setCustomInicio] = useState('');
  const [customFim, setCustomFim] = useState('');
  const [filtroTecnico, setFiltroTecnico] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [foco, setFoco] = useState(null);
  const catRef = useRef(null);
  const tecRef = useRef(null);
  const mesRef = useRef(null);
  const locRef = useRef(null);
  const chartInstances = useRef({});
  const hojeISO = () => new Date().toLocaleDateString('en-CA');
  const CORES = ["#f5c518", "#27ae60", "#3498db", "#e74c3c", "#9b59b6", "#1abc9c", "#e67e22", "#2ecc71", "#2980b9", "#f39c12"];
  useEffect(() => {
    const unsub = fsdb.subscribeRecords(dados => {
      setRegistros(dados);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  useEffect(() => {
    carregarChartJS().then(() => setChartReady(true)).catch(() => setChartErr(true));
  }, []);
  function limitesPeriodo() {
    const hoje = new Date();
    const k = d => d.toLocaleDateString('en-CA');
    switch (periodo) {
      case 'mes': {
        const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        return { inicio: k(ini), fim: k(hoje) };
      }
      case 'trimestre': {
        const t = Math.floor(hoje.getMonth() / 3);
        const ini = new Date(hoje.getFullYear(), t * 3, 1);
        const fim = new Date(hoje.getFullYear(), t * 3 + 3, 0);
        return { inicio: k(ini), fim: k(fim) };
      }
      case 'ano':
        return { inicio: `${hoje.getFullYear()}-01-01`, fim: k(hoje) };
      case 'custom':
        return { inicio: customInicio, fim: customFim };
      default:
        return { inicio: null, fim: null };
    }
  }
  const lim = limitesPeriodo();
  function limiteAnterior() {
    if (!lim.inicio || !lim.fim) return null;
    const dIni = new Date(lim.inicio + 'T12:00:00');
    const dFim = new Date(lim.fim + 'T12:00:00');
    const dias = Math.round((dFim - dIni) / 86400000) + 1;
    const fimPrev = new Date(dIni.getTime() - 86400000);
    const iniPrev = new Date(fimPrev.getTime() - (dias - 1) * 86400000);
    return { inicio: iniPrev.toLocaleDateString('en-CA'), fim: fimPrev.toLocaleDateString('en-CA') };
  }
  const limPrev = limiteAnterior();
  function inPeriodo(r, l) {
    if (!l || !l.inicio && !l.fim) return true;
    if (!r.dataOcorrido) return false;
    if (l.inicio && r.dataOcorrido < l.inicio) return false;
    if (l.fim && r.dataOcorrido > l.fim) return false;
    return true;
  }
  const visiveis = useMemo(() => registros.filter(r => {
    if (!inPeriodo(r, lim)) return false;
    if (filtroTecnico !== 'todos' && r.autorId !== filtroTecnico) return false;
    if (filtroCategoria !== 'todas' && (!r.categorias || !r.categorias.includes(filtroCategoria))) return false;
    if (filtroStatus === 'SIM' && r.concluido !== 'SIM') return false;
    if (filtroStatus === 'NÃO' && r.concluido !== 'NÃO') return false;
    if (foco) {
      if (foco.tipo === 'categoria' && !(r.categorias || []).includes(foco.valor)) return false;
      if (foco.tipo === 'tec' && r.autorId !== foco.valor) return false;
      if (foco.tipo === 'local' && (r.local || '').trim() !== foco.valor) return false;
      if (foco.tipo === 'mes' && (!r.dataOcorrido || r.dataOcorrido.slice(0, 7) !== foco.valor)) return false;
    }
    return true;
  }), [registros, lim.inicio, lim.fim, filtroTecnico, filtroCategoria, filtroStatus, foco]);
  const desvios = useMemo(() => visiveis.filter(r => !(r.categorias || []).includes('Reconhecimento')), [visiveis]);
  const reconhecimentos = useMemo(() => visiveis.filter(r => (r.categorias || []).includes('Reconhecimento')), [visiveis]);
  const stats = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const total = desvios.length;
    const concluidos = desvios.filter(r => r.concluido === "SIM").length;
    const pendentesArr = desvios.filter(r => r.concluido !== "SIM");
    const pendentes = pendentesArr.length;
    const atrasados = pendentesArr.filter(r => {
      const occ = r.dataOcorrido ? new Date(r.dataOcorrido + 'T12:00:00') : null;
      const dias = occ ? Math.max(0, Math.floor((hoje - occ) / 86400000)) : 0;
      if (dias > 7) return true;
      if (r.prazo && new Date(r.prazo + 'T23:59:59') < hoje) return true;
      return false;
    }).length;
    const diasEmAberto = pendentesArr.length ? Math.round(pendentesArr.reduce((acc, r) => {
      const occ = r.dataOcorrido ? new Date(r.dataOcorrido + 'T12:00:00') : hoje;
      return acc + Math.max(0, Math.floor((hoje - occ) / 86400000));
    }, 0) / pendentesArr.length) : 0;
    const tx = total > 0 ? Math.round(concluidos / total * 100) : 0;
    const categorias = {};
    desvios.forEach(r => (r.categorias || []).forEach(c => {
      if (c !== 'Reconhecimento') categorias[c] = (categorias[c] || 0) + 1;
    }));
    const catOrd = Object.entries(categorias).sort((a, b) => b[1] - a[1]);
    const locais = {};
    desvios.forEach(r => {
      if (r.local && r.local.trim()) {
        const l = r.local.trim();
        locais[l] = (locais[l] || 0) + 1;
      }
    });
    const locOrd = Object.entries(locais).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
      total,
      concluidos,
      pendentes,
      atrasados,
      diasEmAberto,
      tx,
      catOrd,
      maxCat: catOrd[0]?.[1] || 1,
      locOrd,
      maxLoc: locOrd[0]?.[1] || 1,
      recs: reconhecimentos.length
    };
  }, [desvios, reconhecimentos]);
  const prevStats = useMemo(() => {
    if (!limPrev) return null;
    const prev = registros.filter(r => inPeriodo(r, limPrev) && !(r.categorias || []).includes('Reconhecimento'));
    const total = prev.length;
    const concluidos = prev.filter(r => r.concluido === "SIM").length;
    const pendentes = prev.filter(r => r.concluido !== "SIM").length;
    return {
      total,
      concluidos,
      pendentes,
      tx: total > 0 ? Math.round(concluidos / total * 100) : 0,
      atrasados: null
    };
  }, [registros, limPrev && limPrev.inicio, limPrev && limPrev.fim]);
  const deltaTotal = prevStats ? prevStats.total > 0 ? Math.round((stats.total - prevStats.total) / prevStats.total * 100) : null : null;
  const deltaConcluidos = prevStats ? prevStats.concluidos > 0 ? Math.round((stats.concluidos - prevStats.concluidos) / prevStats.concluidos * 100) : null : null;
  const deltaPendentes = prevStats ? prevStats.pendentes > 0 ? Math.round((stats.pendentes - prevStats.pendentes) / prevStats.pendentes * 100) : null : null;
  const filtrosAtivos = [filtroTecnico !== 'todos', filtroCategoria !== 'todas', filtroStatus !== 'todos'].filter(Boolean).length;
  const NOMES_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  function rotuloPeriodo() {
    const hoje = new Date();
    switch (periodo) {
      case 'mes':
        return `${NOMES_MESES[hoje.getMonth()]}/${hoje.getFullYear().toString().slice(2)}`;
      case 'trimestre': {
        const t = Math.floor(hoje.getMonth() / 3) + 1;
        return `${t}º tri ${hoje.getFullYear()}`;
      }
      case 'ano':
        return String(hoje.getFullYear());
      case 'custom':
        return customInicio && customFim ? `${customInicio.split('-').reverse().join('/')} a ${customFim.split('-').reverse().join('/')}` : 'Período custom';
      default:
        return 'Todo o período';
    }
  }
  function resumoAtivo() {
    const partes = [rotuloPeriodo()];
    if (filtroTecnico !== 'todos') partes.push(`TST: ${tecnicos.find(t => t.id === filtroTecnico)?.label || filtroTecnico}`);
    if (filtroCategoria !== 'todas') partes.push(filtroCategoria);
    if (filtroStatus !== 'todos') partes.push(filtroStatus === 'SIM' ? 'Concluídos' : 'Pendentes');
    return partes.join(' · ');
  }
  function getTecOrd(lista) {
    const t = {};
    lista.forEach(r => {
      if (r.autorNome) t[r.autorNome] = (t[r.autorNome] || 0) + 1;
    });
    return Object.entries(t).sort((a, b) => b[1] - a[1]);
  }
  function fmtEvol(k) {
    if (k.length === 7) {
      const [yr, m] = k.split('-');
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${meses[+m - 1]}/${yr.slice(2)}`;
    }
    const [yr, m, d] = k.split('-');
    return `${d}/${m}`;
  }
  function getEvolucao(lista) {
    const contagem = {};
    const useDia = lim.inicio && lim.fim && (new Date(lim.fim + 'T12:00:00') - new Date(lim.inicio + 'T12:00:00')) <= 45 * 86400000;
    lista.forEach(r => {
      if (!r.dataOcorrido) return;
      const k = useDia ? r.dataOcorrido : r.dataOcorrido.slice(0, 7);
      contagem[k] = (contagem[k] || 0) + 1;
    });
    const chaves = Object.keys(contagem).sort();
    const fin = chaves.filter(k => {
      if (!lim.inicio) return true;
      return k >= lim.inicio.slice(0, k.length) && (!lim.fim || k <= lim.fim.slice(0, k.length));
    });
    const sel = (fin.length > 14 ? fin.slice(-14) : fin);
    return sel.map(k => ({
      key: k,
      label: fmtEvol(k),
      total: contagem[k]
    }));
  }
  const tecOrd = getTecOrd(desvios);
  const evolucao = getEvolucao(desvios);
  const tecnicos = useMemo(() => {
    const m = {};
    registros.forEach(r => {
      if (r.autorNome) m[r.autorId] = r.autorNome;
    });
    return Object.entries(m).map(([id, nome]) => ({
      id,
      label: nome
    }));
  }, [registros]);
  const opsPeriodo = [{
    id: 'mes',
    label: 'Este mês'
  }, {
    id: 'trimestre',
    label: 'Trimestre'
  }, {
    id: 'ano',
    label: 'Ano'
  }, {
    id: 'custom',
    label: 'Custom'
  }, {
    id: 'todos',
    label: 'Todo'
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
  }, ...tecnicos];
  const opsStatus = [{
    id: 'todos',
    label: 'Todos'
  }, {
    id: 'SIM',
    label: 'Concluídos'
  }, {
    id: 'NÃO',
    label: 'Pendentes'
  }];
  function focoExtra() {
    if (!foco) return {};
    if (foco.tipo === 'categoria') return { categoria: foco.valor };
    if (foco.tipo === 'tec') return { tecnico: foco.valor };
    if (foco.tipo === 'local') return { busca: foco.valor };
    if (foco.tipo === 'mes') return { data: 'mes', mesExato: foco.valor };
    return {};
  }
  function navComFiltros(extra) {
    const base = {};
    if (periodo === 'mes') base.data = 'mes';
    if (periodo === 'custom' && customInicio && customFim && customInicio.slice(0, 7) === customFim.slice(0, 7)) {
      base.data = 'mes';
      base.mesExato = customInicio.slice(0, 7);
    }
    if (filtroTecnico !== 'todos') base.tecnico = filtroTecnico;
    if (filtroCategoria !== 'todas') base.categoria = filtroCategoria;
    return { ...base, ...focoExtra(), ...extra };
  }
  function limparFiltros() {
    setFiltroTecnico('todos');
    setFiltroCategoria('todas');
    setFiltroStatus('todos');
    setFoco(null);
  }
  function mudarPeriodo(v) {
    setPeriodo(v);
    setFoco(null);
  }
  useEffect(() => {
    if (!chartReady || chartErr || loading) return;
    if (!catRef.current || !tecRef.current || !mesRef.current || !locRef.current) return;
    Object.values(chartInstances.current).forEach(c => {
      try {
        c.destroy();
      } catch (e) {}
    });
    chartInstances.current = {};
    const C = window.Chart;
    C.defaults.color = 'rgba(232,220,200,0.65)';
    C.defaults.borderColor = 'rgba(255,255,255,0.08)';
    const baseOpt = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            boxWidth: 10,
            font: {
              size: 10
            }
          }
        }
      }
    };
    if (stats.catOrd.length) {
      chartInstances.current.cat = new C(catRef.current, {
        type: 'doughnut',
        data: {
          labels: stats.catOrd.map(([c]) => c),
          datasets: [{
            data: stats.catOrd.map(([, q]) => q),
            backgroundColor: CORES,
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          ...baseOpt,
          cutout: '62%',
          plugins: {
            ...baseOpt.plugins,
            legend: {
              position: 'bottom',
              labels: baseOpt.plugins.legend.labels
            }
          },
          onClick: (e, els) => {
            if (!els.length) return;
            const cat = stats.catOrd[els[0].index][0];
            setFoco({
              tipo: 'categoria',
              valor: cat,
              rotulo: cat
            });
          }
        }
      });
    }
    if (tecOrd.length) {
      chartInstances.current.tec = new C(tecRef.current, {
        type: 'bar',
        data: {
          labels: tecOrd.map(([n]) => n),
          datasets: [{
            label: 'Registros',
            data: tecOrd.map(([, q]) => q),
            backgroundColor: CORES,
            borderRadius: 4
          }]
        },
        options: {
          ...baseOpt,
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            ...baseOpt.plugins,
            legend: {
              display: false
            }
          },
          onClick: (e, els) => {
            if (!els.length) return;
            const nome = tecOrd[els[0].index][0];
            const rec = desvios.find(r => r.autorNome === nome);
            if (rec) setFoco({
              tipo: 'tec',
              valor: rec.autorId,
              rotulo: nome
            });
          }
        }
      });
    }
    if (evolucao.length) {
      chartInstances.current.mes = new C(mesRef.current, {
        type: 'line',
        data: {
          labels: evolucao.map(b => b.label),
          datasets: [{
            label: 'Registros',
            data: evolucao.map(b => b.total),
            borderColor: '#f5a623',
            backgroundColor: 'rgba(245,166,35,0.15)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#f5a623',
            pointRadius: 4
          }]
        },
        options: {
          ...baseOpt,
          plugins: {
            ...baseOpt.plugins,
            legend: {
              display: false
            }
          },
          onClick: (e, els) => {
            if (!els.length) return;
            const b = evolucao[els[0].index];
            const mesExato = b.key.length === 7 ? b.key : b.key.slice(0, 7);
            setFoco({
              tipo: 'mes',
              valor: mesExato,
              rotulo: b.label
            });
          }
        }
      });
    }
    if (stats.locOrd.length) {
      chartInstances.current.loc = new C(locRef.current, {
        type: 'bar',
        data: {
          labels: stats.locOrd.map(([l]) => l.length > 26 ? l.slice(0, 25) + '…' : l),
          datasets: [{
            label: 'Desvios',
            data: stats.locOrd.map(([, q]) => q),
            backgroundColor: CORES,
            borderRadius: 4
          }]
        },
        options: {
          ...baseOpt,
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            ...baseOpt.plugins,
            legend: {
              display: false
            }
          },
          onClick: (e, els) => {
            if (!els.length) return;
            const loc = stats.locOrd[els[0].index][0];
            setFoco({
              tipo: 'local',
              valor: loc,
              rotulo: loc
            });
          }
        }
      });
    }
  }, [chartReady, chartErr, loading, visiveis, stats]);
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
  function barrasCSS(entries, max, corBase) {
    return entries.map(([nome, qtd], i) => {
      const pct = Math.round(qtd / (max || 1) * 100);
      const cor = CORES[i % CORES.length];
      return /*#__PURE__*/React.createElement("div", {
        key: nome,
        style: {
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 3
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: cor,
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
          color: cor
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
          background: `linear-gradient(90deg,${cor},${cor}88)`,
          borderRadius: 4
        }
      })));
    });
  }
  function canvasSec(ref, h, mensagem) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        height: h
      }
    }, chartErr && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "rgba(255,255,255,0.3)",
        fontStyle: "italic",
        padding: 10,
        textAlign: "center"
      }
    }, mensagem || "Carregando gráficos..."), /*#__PURE__*/React.createElement("canvas", {
      ref: ref,
      style: {
        width: "100%",
        height: "100%"
      }
    }));
  }
  async function exportarExcel(dados, ctx) {
    const hojeKey = new Date().toLocaleDateString('en-CA');
    const mesAtual = hojeKey.slice(0, 7);
    const totalR = dados.length;
    const concluidosR = dados.filter(r => r.concluido === "SIM").length;
    const pendentesR = dados.filter(r => r.concluido === "NÃO").length;
    const semStatusR = dados.filter(r => r.concluido !== "SIM" && r.concluido !== "NÃO").length;
    const doMesR = dados.filter(r => r.dataOcorrido?.slice(0, 7) === mesAtual).length;
    const txConclusaoR = totalR > 0 ? Math.round(concluidosR / totalR * 100) : 0;
    const catCount = {};
    dados.forEach(r => (r.categorias || []).forEach(c => {
      if (c !== 'Reconhecimento') catCount[c] = (catCount[c] || 0) + 1;
    }));
    const catOrd = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
    const tecCount = {};
    dados.forEach(r => {
      if (r.autorNome) tecCount[r.autorNome] = (tecCount[r.autorNome] || 0) + 1;
    });
    const tecOrd = Object.entries(tecCount).sort((a, b) => b[1] - a[1]);
    const mesCount = {};
    dados.forEach(r => {
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
      c.value = `BDR Segurança do Trabalho · Período: ${ctx.titulo}${ctx.filtros ? ' · ' + ctx.filtros : ''}`;
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
      const indicadores = [
        ['Total de Desvios', '', totalR],
        ['Registros Este Mês', '', doMesR],
        ['Concluídos', '', concluidosR],
        ['Pendentes', '', pendentesR],
        ['Sem Status', '', semStatusR],
        ['Reconhecimentos', '', ctx.reconhecimentos],
        ['Taxa de Conclusão', '', txConclusaoR / 100]
      ];
      indicadores.forEach((row, i) => {
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
        if (i === indicadores.length - 1) ws.getCell(`C${r}`).numFmt = '0%';
      });
      const catStart = 6 + indicadores.length + 1;
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
        ws.getCell(`C${r}`).value = barVisual(qtd, maxMes);
        ws.getCell(`C${r}`).font = fnt(10, true, C.green);
        ws.getCell(`C${r}`).fill = fll(bg);
        ws.getCell(`C${r}`).border = bdrA();
      });
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
      [...dados].sort((a, b) => (b.dataOcorrido || "").localeCompare(a.dataOcorrido || "")).forEach((r, i) => {
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
      const pends = dados.filter(r => r.concluido === "NÃO" || !r.concluido).slice().sort((a, b) => (a.dataOcorrido || "").localeCompare(b.dataOcorrido || ""));
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
          const regs = dados.filter(r => r.autorNome === nome);
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
          const regs = dados.filter(r => (r.categorias || []).includes(cat));
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
  function ctxExport() {
    const filtrosTxt = [foco ? foco.rotulo : null, filtroTecnico !== 'todos' ? `TST: ${tecnicos.find(t => t.id === filtroTecnico)?.label || filtroTecnico}` : null, filtroCategoria !== 'todas' ? `Categoria: ${filtroCategoria}` : null, filtroStatus !== 'todos' ? `Status: ${filtroStatus === 'SIM' ? 'Concluídos' : 'Pendentes'}` : null].filter(Boolean).join(' · ');
    return {
      titulo: `${rotuloPeriodo()}${foco ? ' · ' + foco.rotulo : ''}`,
      filtros: filtrosTxt,
      reconhecimentos: stats.recs,
      atrasados: stats.atrasados,
      diasEmAberto: stats.diasEmAberto,
      locais: stats.locOrd
    };
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#000000",
      paddingBottom: 40,
      color: "#ffffff"
    }
  }, /*#__PURE__*/React.createElement(Header, {
    title: foco ? `DASHBOARD · ${foco.rotulo.toUpperCase()}` : "DASHBOARD",
    subtitle: `${stats.total} ${foco ? foco.tipo === 'mes' ? 'desvios no mês' : 'registros' : 'desvios'} · ${resumoAtivo()}`,
    onBack: foco ? () => setFoco(null) : onBack,
    right: foco ? /*#__PURE__*/React.createElement("button", {
      className: "folder-tile-fx",
      onClick: () => onVerRegistros(navComFiltros({})),
      style: {
        "--glow": "#c0392b",
        background: "rgba(192,57,43,0.15)",
        border: "1px solid rgba(192,57,43,0.3)",
        color: "#c0392b",
        borderRadius: 8,
        padding: "7px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "'Oswald',sans-serif",
        fontSize: 11,
        letterSpacing: 1,
        whiteSpace: "nowrap"
      }
    }, /*#__PURE__*/React.createElement(EyeIcon, null), "VER REGISTROS") : null
  }), loading ? /*#__PURE__*/React.createElement(Spinner, null) : /*#__PURE__*/React.createElement("div", {
    className: "shell",
    style: {
      padding: "16px"
    }
  }, foco && /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: () => setFoco(null),
    style: {
      "--glow": "#3498db",
      background: "transparent",
      border: "1px solid rgba(52,152,219,0.4)",
      color: "#3498db",
      fontFamily: "'Oswald',sans-serif",
      fontSize: 11,
      padding: "8px 14px",
      borderRadius: 20,
      cursor: "pointer",
      letterSpacing: 1,
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(BackIcon, null), "VOLTAR AO DASHBOARD"), !foco && /*#__PURE__*/React.createElement("div", {
    className: "dash-filters"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(FiltroChips, {
    label: "Per\xEDodo",
    opcoes: opsPeriodo,
    valor: periodo,
    onChange: mudarPeriodo
  })), periodo === 'custom' && /*#__PURE__*/React.createElement("div", {
    className: "g2",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "De"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: customInicio,
    onChange: e => setCustomInicio(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "At\xE9"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: customFim,
    onChange: e => setCustomFim(e.target.value)
  }))), /*#__PURE__*/React.createElement(FiltroChips, {
    label: "Por TST",
    opcoes: opsTecs,
    valor: filtroTecnico,
    onChange: setFiltroTecnico
  }), /*#__PURE__*/React.createElement(FiltroChips, {
    label: "Por Categoria",
    opcoes: opsCats,
    valor: filtroCategoria,
    onChange: setFiltroCategoria
  }), /*#__PURE__*/React.createElement(FiltroChips, {
    label: "Por Status",
    opcoes: opsStatus,
    valor: filtroStatus,
    onChange: setFiltroStatus
  }), filtrosAtivos > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: limparFiltros,
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
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(FilterIcon, {
    size: 12
  }), "LIMPAR FILTROS")), /*#__PURE__*/React.createElement("div", {
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
  }, stats.pendentes, " pendente", stats.pendentes !== 1 ? "s" : "", prevStats ? ` (antes: ${prevStats.total} de ${prevStats.pendentes})` : ""))), /*#__PURE__*/React.createElement("div", {
    className: "g4",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Desvios",
    val: stats.total,
    cor: "#f5c518",
    icon: /*#__PURE__*/React.createElement(DocumentIcon, {
      size: 20
    }),
    delta: deltaTotal,
    onClick: () => onVerRegistros(navComFiltros({}))
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Conclu\xEDdos",
    val: stats.concluidos,
    cor: "#27ae60",
    icon: /*#__PURE__*/React.createElement(CheckIcon, {
      size: 20
    }),
    delta: deltaConcluidos,
    onClick: () => onVerRegistros(navComFiltros({
      concluido: "SIM"
    }))
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Pendentes",
    val: stats.pendentes,
    cor: "#e74c3c",
    icon: /*#__PURE__*/React.createElement(AlertCircleIcon, null),
    delta: deltaPendentes,
    onClick: () => onVerRegistros(navComFiltros({
      concluido: "NÃO"
    }))
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Em atraso",
    val: stats.atrasados,
    cor: "#e67e22",
    icon: /*#__PURE__*/React.createElement(AlertIcon, {
      size: 20
    }),
    onClick: () => onVerRegistros(navComFiltros({
      concluido: "NÃO"
    }))
  })), /*#__PURE__*/React.createElement("div", {
    className: "g2",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Reconhecimentos",
    val: stats.recs,
    cor: "#3498db",
    icon: /*#__PURE__*/React.createElement(CalendarIcon, {
      size: 20
    }),
    onClick: () => onVerRegistros(navComFiltros({
      categoria: "Reconhecimento"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(52,152,219,0.08)",
      border: "1px solid rgba(52,152,219,0.3)",
      borderRadius: 14,
      padding: "16px 14px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,0.4)",
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1.5,
      textTransform: "uppercase"
    }
  }, "Dias em aberto"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 34,
      fontWeight: 700,
      fontFamily: "'Oswald',sans-serif",
      color: "#3498db",
      lineHeight: 1.2,
      marginTop: 2
    }
  }, stats.diasEmAberto, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,0.4)",
      fontWeight: 400,
      marginLeft: 6
    }
  }, "dias")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "rgba(232,220,200,0.4)",
      marginTop: 4
    }
  }, "m\xE9dia dos pendentes do per\xEDodo"))), /*#__PURE__*/React.createElement("div", {
    className: "dash-charts"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0d0d0d",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "18px"
    }
  }, sec("Desvios por Categoria", "toque para filtrar"), stats.catOrd.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "rgba(255,255,255,0.3)",
      fontSize: 12,
      padding: 10
    }
  }, "Sem dados no per\xEDodo") : chartErr ? /*#__PURE__*/React.createElement("div", null, barrasCSS(stats.catOrd, stats.maxCat, CORES)) : /*#__PURE__*/React.createElement("div", null, canvasSec(catRef, 260))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0d0d0d",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "18px"
    }
  }, sec("RDR por TST", "toque para filtrar"), tecOrd.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "rgba(255,255,255,0.3)",
      fontSize: 12,
      padding: 10
    }
  }, "Sem dados no per\xEDodo") : chartErr ? /*#__PURE__*/React.createElement("div", null, barrasCSS(tecOrd, tecOrd[0]?.[1] || 1, CORES)) : /*#__PURE__*/React.createElement("div", null, canvasSec(tecRef, 280))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0d0d0d",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "18px"
    }
  }, sec("Evolu\xE7\xE3o", "desvios no per\xEDodo"), evolucao.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "rgba(255,255,255,0.3)",
      fontSize: 12,
      padding: 10
    }
  }, "Sem dados no per\xEDodo") : chartErr ? /*#__PURE__*/React.createElement("div", null, barrasCSS(evolucao.map(b => [b.label, b.total]), Math.max(...evolucao.map(b => b.total), 1), CORES)) : /*#__PURE__*/React.createElement("div", null, canvasSec(mesRef, 220))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0d0d0d",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "18px"
    }
  }, sec("Locais com mais desvios", "toque para abrir os registros"), stats.locOrd.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "rgba(255,255,255,0.3)",
      fontSize: 12,
      padding: 10
    }
  }, "Sem dados no per\xEDodo") : chartErr ? /*#__PURE__*/React.createElement("div", null, barrasCSS(stats.locOrd, stats.maxLoc, CORES)) : /*#__PURE__*/React.createElement("div", null, canvasSec(locRef, 300)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: () => exportarExcel(desvios, ctxExport()),
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
    onClick: () => gerarPDFDashboard(desvios, ctxExport()),
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
