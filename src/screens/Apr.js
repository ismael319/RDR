function ParagraphListEditor({
  label,
  items,
  onChange
}) {
  function updateItem(i, value) {
    const v = [...items];
    v[i] = value;
    onChange(v);
  }
  function removeItem(i) {
    onChange(items.filter((_, j) => j !== i));
  }
  function addItem() {
    onChange([...items, '']);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 11,
      color: 'rgba(245,166,35,0.6)',
      letterSpacing: 1
    }
  }, label, " (", items.length, ")"), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    onClick: addItem
  }, /*#__PURE__*/React.createElement(PlusIcon, {
    size: 11
  }), "ITEM")), items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 6,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: '#c0392b',
      fontWeight: 700,
      padding: '8px 0',
      minWidth: 16
    }
  }, i + 1, "."), /*#__PURE__*/React.createElement("textarea", {
    value: it,
    onChange: e => updateItem(i, e.target.value),
    rows: 1,
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeItem(i),
    style: {
      background: 'none',
      border: 'none',
      color: '#e74c3c',
      cursor: 'pointer',
      fontSize: 14,
      padding: '8px 4px',
      display: 'inline-flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 13
  })))), items.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.25)',
      padding: '6px 0'
    }
  }, "Nenhum item. Clique em \"+ ITEM\" para adicionar."));
}
function toISODate(d) {
  return d.toISOString().slice(0, 10);
}
function isoToBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function addDaysISO(iso, days) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toISODate(d);
}
function AprScreen({
  user,
  onBack
}) {
  const [nivel, setNivel] = React.useState('menu'); // 'menu' | 'atividades' | 'atividade' | 'montar' | 'historico'
  const [atividades, setAtividades] = React.useState([]);
  const [montagens, setMontagens] = React.useState([]);
  const [log, setLog] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [buscaAtividades, setBuscaAtividades] = React.useState('');
  const [atividadeAbertaId, setAtividadeAbertaId] = React.useState(null);
  const [showAvulsaAtividade, setShowAvulsaAtividade] = React.useState(false);
  const [buscaAvulsaAtividade, setBuscaAvulsaAtividade] = React.useState('');
  const [importStatus, setImportStatus] = React.useState('');
  const [confirmDel, setConfirmDel] = React.useState(null);
  const [editCtx, setEditCtx] = React.useState(null);
  const [editForm, setEditForm] = React.useState({
    fase: '',
    riscos: [],
    consequencias: [],
    medidasIndividuais: [],
    medidasColetivas: []
  });
  const [showNovaAtividade, setShowNovaAtividade] = React.useState(false);
  const [novaAtividadeForm, setNovaAtividadeForm] = React.useState({
    nome: '',
    area: '',
    assunto: '',
    equipamentos: '',
    epis: '',
    recomendacoesGerais: ''
  });
  const [editAtividadeId, setEditAtividadeId] = React.useState(null);
  const [editAtividadeNome, setEditAtividadeNome] = React.useState('');
  const [confirmDelAtividade, setConfirmDelAtividade] = React.useState(null);
  const [buscaEscolher, setBuscaEscolher] = React.useState('');
  const [buscaAvulsa, setBuscaAvulsa] = React.useState('');
  const [orderedFases, setOrderedFases] = React.useState([]);
  const [montagemNome, setMontagemNome] = React.useState('');
  const [montagemHeader, setMontagemHeader] = React.useState(() => defaultHeader());
  const [editMontagemIdx, setEditMontagemIdx] = React.useState(null);
  const [editMontagemForm, setEditMontagemForm] = React.useState({
    fase: '',
    riscos: [],
    consequencias: [],
    medidasIndividuais: [],
    medidasColetivas: []
  });
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [montagemPreviewOpen, setMontagemPreviewOpen] = React.useState(false);
  const [expandedFases, setExpandedFases] = React.useState(() => new Set());
  const atividadeAberta = atividades.find(a => a.id === atividadeAbertaId) || null;
  function toggleExpandFase(uid) {
    setExpandedFases(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);else next.add(uid);
      return next;
    });
  }
  async function handleNovaAtividade() {
    if (!novaAtividadeForm.nome.trim()) {
      alert('Defina um nome para a atividade');
      return;
    }
    await aprDb.saveAtividade({
      ...novaAtividadeForm,
      nome: novaAtividadeForm.nome.trim()
    });
    setNovaAtividadeForm({
      nome: '',
      area: '',
      assunto: '',
      equipamentos: '',
      epis: '',
      recomendacoesGerais: ''
    });
    setShowNovaAtividade(false);
  }
  async function handleDeleteAtividade(id) {
    await aprDb.deleteAtividade(id);
    setConfirmDel(null);
  }
  async function handleEditAtividadeNome(id) {
    if (!editAtividadeNome.trim()) {
      alert('Defina um nome');
      return;
    }
    const atv = atividades.find(a => a.id === id);
    if (!atv) return;
    const {
      id: _,
      ...data
    } = atv;
    await aprDb.saveAtividade({
      id,
      ...data,
      nome: editAtividadeNome.trim()
    });
    setEditAtividadeId(null);
    setEditAtividadeNome('');
  }
  function adicionarFaseEmBranco() {
    setOrderedFases(arr => [...arr, {
      _uid: `nova_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`,
      fase: 'Nova fase',
      riscos: [],
      consequencias: [],
      medidasIndividuais: [],
      medidasColetivas: []
    }]);
  }
  function gerarNumeroAPR() {
    const ano = new Date().getFullYear();
    const seq = String(montagens.length + 1).padStart(3, '0');
    return `APR-${ano}-${seq}`;
  }
  function getResponsavelDefaults() {
    if (user.role === 'gestor') return {
      responsavelSesmt: 'Bruno Galvão',
      funcao: 'Engenheiro de Segurança do Trabalho'
    };
    return {
      responsavelSesmt: user.nome || '',
      funcao: ''
    };
  }
  function defaultHeader() {
    const hoje = toISODate(new Date());
    const resp = getResponsavelDefaults();
    return {
      numero: gerarNumeroAPR(),
      area: '',
      responsavelSesmt: resp.responsavelSesmt,
      funcao: resp.funcao,
      assunto: '',
      local: '',
      equipamentos: '',
      epis: '',
      recomendacoesGerais: '',
      dataInicio: hoje,
      dataTermino: addDaysISO(hoje, 30)
    };
  }
  function voltar() {
    if (nivel === 'atividade') setNivel('atividades');else if (nivel === 'menu') onBack();else setNivel('menu');
  }
  function startEditFase(atividade, faseIndex) {
    const f = atividade.fases[faseIndex];
    setEditCtx({
      atividade,
      faseIndex
    });
    setEditForm({
      fase: f.fase,
      riscos: [...(f.riscos || [])],
      consequencias: [...(f.consequencias || [])],
      medidasIndividuais: [...(f.medidasIndividuais || [])],
      medidasColetivas: [...(f.medidasColetivas || [])]
    });
  }
  async function handleEditSave() {
    if (!editForm.fase.trim()) {
      alert('Defina um nome para a fase');
      return;
    }
    const {
      atividade,
      faseIndex
    } = editCtx;
    const clean = arr => arr.map(s => s.trim()).filter(Boolean);
    const novasFases = atividade.fases.map((f, i) => i !== faseIndex ? f : {
      fase: editForm.fase,
      riscos: clean(editForm.riscos),
      consequencias: clean(editForm.consequencias),
      medidasIndividuais: clean(editForm.medidasIndividuais),
      medidasColetivas: clean(editForm.medidasColetivas)
    });
    const {
      id,
      ...data
    } = atividade;
    await aprDb.saveAtividade({
      id,
      ...data,
      fases: novasFases
    });
    await aprDb.logEdicao({
      tipo: 'Fase editada',
      atividadeId: id,
      atividadeNome: atividade.nome,
      faseNome: editForm.fase,
      autorNome: user.nome,
      antes: atividade.fases,
      depois: novasFases
    });
    setEditCtx(null);
  }
  async function moverFaseAtividade(atividade, idx, dir) {
    const fases = [...(atividade.fases || [])];
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= fases.length) return;
    [fases[idx], fases[alvo]] = [fases[alvo], fases[idx]];
    const {
      id,
      ...data
    } = atividade;
    await aprDb.saveAtividade({
      id,
      ...data,
      fases
    });
    await aprDb.logEdicao({
      tipo: 'Ordem de fases alterada',
      atividadeId: id,
      atividadeNome: atividade.nome,
      faseNome: fases[alvo].fase,
      autorNome: user.nome,
      antes: atividade.fases,
      depois: fases
    });
  }
  async function removerFaseAtividade(atividade, faseIndex) {
    if (!confirm('Remover esta fase da atividade?')) return;
    const fases = (atividade.fases || []).filter((_, i) => i !== faseIndex);
    const {
      id,
      ...data
    } = atividade;
    await aprDb.saveAtividade({
      id,
      ...data,
      fases
    });
    await aprDb.logEdicao({
      tipo: 'Fase removida',
      atividadeId: id,
      atividadeNome: atividade.nome,
      faseNome: (atividade.fases || [])[faseIndex]?.fase || '',
      autorNome: user.nome,
      antes: atividade.fases,
      depois: fases
    });
  }
  function startEditMontagemFase(idx) {
    const f = orderedFases[idx];
    setEditMontagemIdx(idx);
    setEditMontagemForm({
      fase: f.fase,
      riscos: [...(f.riscos || [])],
      consequencias: [...(f.consequencias || [])],
      medidasIndividuais: [...(f.medidasIndividuais || [])],
      medidasColetivas: [...(f.medidasColetivas || [])]
    });
  }
  function handleEditMontagemSave() {
    if (!editMontagemForm.fase.trim()) {
      alert('Defina um nome para a fase');
      return;
    }
    const clean = arr => arr.map(s => s.trim()).filter(Boolean);
    setOrderedFases(arr => arr.map((f, i) => i !== editMontagemIdx ? f : {
      ...f,
      fase: editMontagemForm.fase,
      riscos: clean(editMontagemForm.riscos),
      consequencias: clean(editMontagemForm.consequencias),
      medidasIndividuais: clean(editMontagemForm.medidasIndividuais),
      medidasColetivas: clean(editMontagemForm.medidasColetivas)
    }));
    setEditMontagemIdx(null);
  }
  async function adicionarFaseNaAtividade(atividadeDestino, faseOrigem, nomeOrigemAtividade) {
    const {
      _uid,
      ...faseLimpa
    } = clonarFase(faseOrigem, nomeOrigemAtividade);
    const {
      id,
      ...data
    } = atividadeDestino;
    const novasFases = [...(atividadeDestino.fases || []), faseLimpa];
    await aprDb.saveAtividade({
      id,
      ...data,
      fases: novasFases
    });
    await aprDb.logEdicao({
      tipo: 'Fase avulsa adicionada',
      atividadeId: id,
      atividadeNome: atividadeDestino.nome,
      faseNome: faseLimpa.fase,
      autorNome: user.nome,
      antes: atividadeDestino.fases || [],
      depois: novasFases
    });
    setBuscaAvulsaAtividade('');
    setShowAvulsaAtividade(false);
  }
  async function handleDeleteLog(logId) {
    if (!confirm('Excluir este registro do histórico?')) return;
    await aprDb.deleteLog(logId);
  }
  async function desfazerAlteracao(item) {
    if (!item.atividadeId || !item.antes) {
      alert('Não é possível desfazer esta alteração.');
      return;
    }
    if (!confirm('Desfazer esta alteração? A atividade voltará ao estado anterior.')) return;
    const atividadeAtual = atividades.find(a => a.id === item.atividadeId);
    if (!atividadeAtual) {
      alert('Atividade não encontrada (pode ter sido excluída).');
      return;
    }
    const {
      id,
      ...data
    } = atividadeAtual;
    await aprDb.saveAtividade({
      id,
      ...data,
      fases: item.antes
    });
    await aprDb.marcarLogRevertido(item.id);
    await aprDb.logEdicao({
      tipo: 'Alteração desfeita',
      atividadeId: id,
      atividadeNome: atividadeAtual.nome,
      faseNome: item.faseNome,
      autorNome: user.nome,
      antes: item.depois,
      depois: item.antes
    });
  }
  function imprimirAtividade(atividade) {
    const hoje = toISODate(new Date());
    const resp = getResponsavelDefaults();
    gerarDocxAPR({
      nome: atividade.nome,
      numero: gerarNumeroAPR(),
      area: atividade.area,
      assunto: atividade.assunto,
      equipamentos: atividade.equipamentos,
      epis: atividade.epis,
      recomendacoesGerais: atividade.recomendacoesGerais,
      responsavelSesmt: resp.responsavelSesmt,
      funcao: resp.funcao,
      local: '',
      dataInicio: hoje,
      dataTermino: addDaysISO(hoje, 30),
      fases: atividade.fases || []
    });
  }
  React.useEffect(() => {
    const unsub1 = aprDb.subscribeAtividades(data => {
      setAtividades(data);
      setLoading(false);
    });
    const unsub2 = aprDb.subscribeMontagens(data => {
      setMontagens(data);
    });
    const unsub3 = aprDb.subscribeLog(data => {
      setLog(data);
    });
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);
  function handleImport(file) {
    setImportStatus('Lendo arquivo...');
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        let data = JSON.parse(e.target.result);
        if (data.value) data = data.value;
        if (!Array.isArray(data)) throw new Error('Formato invalido');
        const count = await aprDb.importAtividades(data);
        setImportStatus(`${count} atividades importadas com sucesso!`);
        setTimeout(() => setImportStatus(''), 3000);
      } catch (err) {
        setImportStatus('Erro: ' + err.message);
      }
    };
    reader.readAsText(file);
  }
  function clonarFase(f, atividadeNome) {
    return {
      _uid: `${atividadeNome}_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`,
      fase: f.fase,
      riscos: [...(f.riscos || [])],
      consequencias: [...(f.consequencias || [])],
      medidasIndividuais: [...(f.medidasIndividuais || [])],
      medidasColetivas: [...(f.medidasColetivas || [])]
    };
  }
  function escolherAtividade(atividade) {
    setOrderedFases((atividade.fases || []).map(f => clonarFase(f, atividade.nome)));
    setMontagemNome(atividade.nome);
    setMontagemHeader(h => ({
      ...h,
      area: atividade.area || h.area,
      assunto: atividade.assunto || h.assunto,
      equipamentos: atividade.equipamentos || h.equipamentos,
      epis: atividade.epis || h.epis,
      recomendacoesGerais: atividade.recomendacoesGerais || h.recomendacoesGerais
    }));
    setBuscaEscolher('');
  }
  function adicionarFaseAvulsa(f, atividadeNome) {
    setOrderedFases(arr => [...arr, clonarFase(f, atividadeNome)]);
  }
  function removerFase(idx) {
    setOrderedFases(arr => arr.filter((_, i) => i !== idx));
  }
  function moveUp(idx) {
    if (idx === 0) return;
    const arr = [...orderedFases];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    setOrderedFases(arr);
  }
  function moveDown(idx) {
    if (idx === orderedFases.length - 1) return;
    const arr = [...orderedFases];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setOrderedFases(arr);
  }
  async function saveMontagem() {
    if (!montagemNome.trim()) {
      alert('Defina um nome para a APR');
      return;
    }
    if (orderedFases.length === 0) {
      alert('Escolha uma atividade ou adicione fases');
      return;
    }
    await aprDb.saveMontagem({
      nome: montagemNome.trim(),
      ...montagemHeader,
      fases: orderedFases.map(({
        _uid,
        ...f
      }) => f),
      autorId: user.id,
      autorNome: user.nome
    });
    setMontagemNome('');
    setOrderedFases([]);
    setMontagemHeader(defaultHeader());
    alert('APR salva com sucesso!');
  }
  async function deleteMontagem(id) {
    await aprDb.deleteMontagem(id);
    setConfirmDel(null);
  }
  const filtered = atividades.filter(a => (a.nome || '').toLowerCase().includes(buscaAtividades.toLowerCase()));
  const opcoesEscolher = buscaEscolher.trim() ? atividades.filter(a => (a.nome || '').toLowerCase().includes(buscaEscolher.toLowerCase())) : [];
  const todasFasesAvulsas = atividades.flatMap(a => (a.fases || []).map(f => ({
    ...f,
    _atividadeNome: a.nome
  })));
  const fasesAvulsasFiltradas = buscaAvulsa.trim() ? todasFasesAvulsas.filter(f => (f.fase || '').toLowerCase().includes(buscaAvulsa.toLowerCase()) || (f._atividadeNome || '').toLowerCase().includes(buscaAvulsa.toLowerCase())) : [];
  const fasesAvulsasAtividadeFiltradas = buscaAvulsaAtividade.trim() ? todasFasesAvulsas.filter(f => (f.fase || '').toLowerCase().includes(buscaAvulsaAtividade.toLowerCase()) || (f._atividadeNome || '').toLowerCase().includes(buscaAvulsaAtividade.toLowerCase())) : [];
  const historicoItens = [...montagens.map(m => ({
    ...m,
    _tipo: 'montagem'
  })), ...log.map(l => ({
    ...l,
    _tipo: 'log'
  }))].sort((a, b) => new Date(b.criada_em || b.criadaEm || 0).getTime() - new Date(a.criada_em || a.criadaEm || 0).getTime());
  const navTitleStyle = {
    fontFamily: "'Oswald',sans-serif",
    fontWeight: 600,
    fontSize: 15,
    color: "#f5c518",
    letterSpacing: 1
  };
  const navSubStyle = {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2
  };
  const acaoCardStyle = {
    flex: '1 1 200px',
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(245,166,35,0.2)",
    borderRadius: 14,
    padding: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10
  };
  const acaoIconStyle = {
    width: 38,
    height: 38,
    background: "rgba(192,57,43,0.2)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#f5c518"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: '#000',
      paddingBottom: 40,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Header, {
    title: "APR",
    subtitle: "An\xE1lise Preliminar de Risco",
    onBack: voltar
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16
    }
  }, nivel === 'menu' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      marginTop: "12vh",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(FolderTile, {
    label: "Atividades",
    sub: "APRs prontas, organizadas por atividade",
    icon: /*#__PURE__*/React.createElement(FolderIcon, null),
    color: "#f5c518",
    onClick: () => setNivel('atividades')
  }), /*#__PURE__*/React.createElement(FolderTile, {
    label: "Montar APR",
    sub: "Montar uma APR combinando fases",
    icon: /*#__PURE__*/React.createElement(PlusIcon, {
      size: 26
    }),
    color: "#c0392b",
    onClick: () => setNivel('montar')
  }), /*#__PURE__*/React.createElement(FolderTile, {
    label: "Hist\xF3rico",
    sub: "APRs salvas e altera\xE7\xF5es recentes",
    icon: /*#__PURE__*/React.createElement(CalendarIcon, {
      size: 26
    }),
    color: "#ffffff",
    onClick: () => setNivel('historico')
  })), nivel === 'atividades' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: buscaAtividades,
    onChange: e => setBuscaAtividades(e.target.value),
    placeholder: "Buscar atividade...",
    style: {
      flex: 1,
      minWidth: 120,
      background: '#111',
      border: '1px solid rgba(245,166,35,0.2)',
      borderRadius: 8,
      padding: '8px 12px',
      color: '#e8dcc8',
      fontSize: 13,
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn",
    onClick: () => {
      setNovaAtividadeForm({
        nome: '',
        area: '',
        assunto: '',
        equipamentos: '',
        epis: '',
        recomendacoesGerais: ''
      });
      setShowNovaAtividade(true);
    }
  }, /*#__PURE__*/React.createElement(PlusIcon, {
    size: 16
  }), "NOVA"), /*#__PURE__*/React.createElement("label", {
    className: "apr-btn",
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(UploadIcon, {
    size: 16
  }), "IMPORTAR JSON", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".json",
    style: {
      display: 'none'
    },
    onChange: e => {
      if (e.target.files[0]) handleImport(e.target.files[0]);
      e.target.value = '';
    }
  }))), showNovaAtividade && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(192,57,43,0.08)',
      border: '1px solid rgba(245,166,35,0.2)',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Nova Atividade"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nome da Atividade"
  }, /*#__PURE__*/React.createElement("input", {
    value: novaAtividadeForm.nome,
    onChange: e => setNovaAtividadeForm(f => ({
      ...f,
      nome: e.target.value
    })),
    placeholder: "Ex: Pintura"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\xC1rea"
  }, /*#__PURE__*/React.createElement("input", {
    value: novaAtividadeForm.area,
    onChange: e => setNovaAtividadeForm(f => ({
      ...f,
      area: e.target.value
    })),
    placeholder: "Ex: Produ\xE7\xE3o"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Assunto / Trabalho"
  }, /*#__PURE__*/React.createElement("input", {
    value: novaAtividadeForm.assunto,
    onChange: e => setNovaAtividadeForm(f => ({
      ...f,
      assunto: e.target.value
    })),
    placeholder: "Ex: Pintura de estruturas met\xE1licas"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Equipamentos"
  }, /*#__PURE__*/React.createElement("input", {
    value: novaAtividadeForm.equipamentos,
    onChange: e => setNovaAtividadeForm(f => ({
      ...f,
      equipamentos: e.target.value
    })),
    placeholder: "Ex: Pistola de pintura, compressor"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "EPI's"
  }, /*#__PURE__*/React.createElement("input", {
    value: novaAtividadeForm.epis,
    onChange: e => setNovaAtividadeForm(f => ({
      ...f,
      epis: e.target.value
    })),
    placeholder: "Ex: Luvas, \xF3culos, respirador"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Recomenda\xE7\xF5es Gerais"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: novaAtividadeForm.recomendacoesGerais,
    onChange: e => setNovaAtividadeForm(f => ({
      ...f,
      recomendacoesGerais: e.target.value
    })),
    placeholder: "Recomenda\xE7\xF5es gerais de seguran\xE7a"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowNovaAtividade(false),
    style: {
      flex: 1,
      background: 'transparent',
      border: '1px solid rgba(232,220,200,0.2)',
      color: 'rgba(255,255,255,0.6)',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 12
  }), "CANCELAR"), /*#__PURE__*/React.createElement("button", {
    onClick: handleNovaAtividade,
    style: {
      flex: 2,
      background: 'rgba(192,57,43,0.8)',
      border: 'none',
      color: '#fff',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(PlusCircleIcon, {
    size: 13
  }), "CRIAR ATIVIDADE"))), importStatus && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(39,174,96,0.12)',
      border: '1px solid rgba(39,174,96,0.3)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      color: '#27ae60',
      marginBottom: 12
    }
  }, importStatus), loading ? /*#__PURE__*/React.createElement("div", {
    className: "apr-empty"
  }, /*#__PURE__*/React.createElement(Spinner, null)) : filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "apr-empty"
  }, "NENHUMA ATIVIDADE ENCONTRADA", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.2)'
    }
  }, "Crie uma nova atividade ou importe JSON")) : filtered.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    className: "apr-card",
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "apr-card-header"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      minWidth: 0,
      cursor: 'pointer'
    },
    onClick: () => {
      setAtividadeAbertaId(a.id);
      setShowAvulsaAtividade(false);
      setNivel('atividade');
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, a.nome), /*#__PURE__*/React.createElement("span", {
    className: "apr-badge"
  }, (a.fases || []).length, " fases"), /*#__PURE__*/React.createElement(ChevronRight, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginLeft: 8
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    onClick: () => {
      setEditAtividadeId(a.id);
      setEditAtividadeNome(a.nome);
    }
  }, /*#__PURE__*/React.createElement(EditIcon, {
    size: 11
  }), "EDITAR"), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    style: {
      color: '#e74c3c',
      borderColor: 'rgba(231,76,60,0.3)'
    },
    onClick: () => setConfirmDelAtividade(a.id)
  }, /*#__PURE__*/React.createElement(TrashIcon, {
    size: 12
  })))))), editAtividadeId && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#111',
      border: '1px solid rgba(245,166,35,0.2)',
      borderRadius: 16,
      padding: 24,
      maxWidth: 360,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 16,
      color: '#fff',
      letterSpacing: 1,
      marginBottom: 16
    }
  }, "EDITAR NOME"), /*#__PURE__*/React.createElement(Field, {
    label: "Nome da Atividade"
  }, /*#__PURE__*/React.createElement("input", {
    value: editAtividadeNome,
    onChange: e => setEditAtividadeNome(e.target.value),
    placeholder: "Nome da atividade"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditAtividadeId(null),
    style: {
      flex: 1,
      background: 'transparent',
      border: '1px solid rgba(232,220,200,0.2)',
      color: 'rgba(255,255,255,0.6)',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 12
  }), "CANCELAR"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleEditAtividadeNome(editAtividadeId),
    style: {
      flex: 2,
      background: 'rgba(192,57,43,0.8)',
      border: 'none',
      color: '#fff',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, "SALVAR"))))), nivel === 'atividade' && atividadeAberta && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 18,
      color: '#f5c518',
      letterSpacing: 1,
      marginBottom: 2
    }
  }, atividadeAberta.nome), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.4)',
      marginBottom: 16
    }
  }, (atividadeAberta.fases || []).length, " fase(s)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    style: {
      ...acaoCardStyle,
      "--glow": "#f5c518"
    },
    onClick: () => imprimirAtividade(atividadeAberta)
  }, /*#__PURE__*/React.createElement("div", {
    className: "folder-tile-fx-icon",
    style: {
      ...acaoIconStyle,
      position: "relative",
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement(DownloadIcon, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      flex: 1,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...navTitleStyle,
      fontSize: 13
    }
  }, "IMPRIMIR"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...navSubStyle,
      fontSize: 11
    }
  }, "Exportar esta APR em DOCX"))), /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    style: {
      ...acaoCardStyle,
      "--glow": "#f5c518"
    },
    onClick: () => setShowAvulsaAtividade(s => !s)
  }, /*#__PURE__*/React.createElement("div", {
    className: "folder-tile-fx-icon",
    style: {
      ...acaoIconStyle,
      position: "relative",
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement(PlusIcon, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      flex: 1,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...navTitleStyle,
      fontSize: 13
    }
  }, "ADICIONAR FASE AVULSA"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...navSubStyle,
      fontSize: 11
    }
  }, "Trazer uma fase de outra atividade"))), /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    style: {
      ...acaoCardStyle,
      "--glow": "#f5c518"
    },
    onClick: () => setPreviewOpen(true)
  }, /*#__PURE__*/React.createElement("div", {
    className: "folder-tile-fx-icon",
    style: {
      ...acaoIconStyle,
      position: "relative",
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement(EyeIcon, {
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      flex: 1,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...navTitleStyle,
      fontSize: 13
    }
  }, "PR\xC9VIA DO DOCUMENTO"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...navSubStyle,
      fontSize: 11
    }
  }, "Ver como a APR vai ficar")))), showAvulsaAtividade && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(245,166,35,0.12)',
      borderRadius: 10,
      padding: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: buscaAvulsaAtividade,
    onChange: e => setBuscaAvulsaAtividade(e.target.value),
    placeholder: "Buscar fase em qualquer atividade...",
    style: {
      width: '100%',
      background: '#111',
      border: '1px solid rgba(245,166,35,0.2)',
      borderRadius: 8,
      padding: '8px 12px',
      color: '#e8dcc8',
      fontSize: 13,
      outline: 'none',
      marginBottom: 8
    }
  }), !buscaAvulsaAtividade.trim() ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.3)',
      padding: '6px 0'
    }
  }, "Digite para buscar uma fase") : fasesAvulsasAtividadeFiltradas.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.3)',
      padding: '6px 0'
    }
  }, "Nenhuma fase encontrada") : fasesAvulsasAtividadeFiltradas.map((f, fi) => /*#__PURE__*/React.createElement("div", {
    key: fi,
    className: "apr-card",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 12,
      color: '#e8dcc8'
    }
  }, f.fase), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.3)'
    }
  }, f._atividadeNome, " \xB7 ", (f.riscos || []).length, " riscos")), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    onClick: () => adicionarFaseNaAtividade(atividadeAberta, f, f._atividadeNome)
  }, /*#__PURE__*/React.createElement(PlusIcon, {
    size: 11
  }), "ADICIONAR")))), (atividadeAberta.fases || []).map((f, fi) => /*#__PURE__*/React.createElement("div", {
    key: fi,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'rgba(0,0,0,0.3)',
      borderRadius: 8,
      padding: '8px 10px',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 12,
      color: '#e8dcc8'
    }
  }, fi + 1, ". ", f.fase), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.3)'
    }
  }, (f.riscos || []).length, " riscos \xB7 ", (f.consequencias || []).length, " consequ\xEAncias \xB7 ", (f.medidasIndividuais || []).length, " medidas individuais \xB7 ", (f.medidasColetivas || []).length, " medidas coletivas")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    onClick: () => startEditFase(atividadeAberta, fi)
  }, /*#__PURE__*/React.createElement(EditIcon, {
    size: 11
  }), "EDITAR"), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    onClick: () => moverFaseAtividade(atividadeAberta, fi, -1),
    disabled: fi === 0,
    style: {
      opacity: fi === 0 ? 0.3 : 1,
      padding: '3px 7px'
    }
  }, /*#__PURE__*/React.createElement(ArrowUpIcon, {
    size: 11
  })), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    onClick: () => moverFaseAtividade(atividadeAberta, fi, 1),
    disabled: fi === (atividadeAberta.fases || []).length - 1,
    style: {
      opacity: fi === (atividadeAberta.fases || []).length - 1 ? 0.3 : 1,
      padding: '3px 7px'
    }
  }, /*#__PURE__*/React.createElement(ArrowDownIcon, {
    size: 11
  })), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    style: {
      color: '#e74c3c',
      borderColor: 'rgba(231,76,60,0.3)'
    },
    onClick: () => removerFaseAtividade(atividadeAberta, fi)
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 11
  })))))), previewOpen && atividadeAberta && (() => {
    const hoje = toISODate(new Date());
    const resp = getResponsavelDefaults();
    const numero = gerarNumeroAPR();
    const dataTermino = addDaysISO(hoje, 30);
    const tdStyle = {
      border: '1px solid #999',
      padding: '6px 8px',
      verticalAlign: 'top'
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 20,
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        color: '#111',
        borderRadius: 8,
        padding: 24,
        maxWidth: 960,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        fontFamily: 'Arial, sans-serif',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 16
      }
    }, "PR\xC9VIA DO DOCUMENTO"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setPreviewOpen(false),
      style: {
        background: '#c0392b',
        border: 'none',
        color: '#fff',
        borderRadius: 6,
        padding: '6px 12px',
        cursor: 'pointer',
        fontFamily: "'Oswald',sans-serif",
        fontSize: 11,
        letterSpacing: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(XIcon, {
      size: 13
    }), "FECHAR")), /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: 12,
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "N\xFAmero da APR:"), " ", numero), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "Data:"), " ", isoToBR(hoje)), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "\xC1rea:"), " ", atividadeAberta.area || '—')), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "Respons\xE1vel SESMT:"), " ", resp.responsavelSesmt || '—'), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "Fun\xE7\xE3o:"), " ", resp.funcao || '—'), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "Assunto:"), " ", atividadeAberta.assunto || '—')), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: tdStyle,
      colSpan: 2
    }, /*#__PURE__*/React.createElement("b", null, "In\xEDcio:"), " ", isoToBR(hoje), " \xA0 ", /*#__PURE__*/React.createElement("b", null, "T\xE9rmino:"), " ", isoToBR(dataTermino)), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "Equipamentos:"), " ", atividadeAberta.equipamentos || '—')), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: tdStyle,
      colSpan: 3
    }, /*#__PURE__*/React.createElement("b", null, "EPI's / E.P.C.s:"), " ", atividadeAberta.epis || '—')))), /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, ['FASES DA OPERAÇÃO', 'RISCO DE ACIDENTE', 'CONSEQUÊNCIAS', 'MEDIDAS INDIVIDUAIS', 'MEDIDAS COLETIVAS'].map(h => /*#__PURE__*/React.createElement("th", {
      key: h,
      style: {
        ...tdStyle,
        background: '#2a2a2a',
        color: '#fff',
        textAlign: 'left'
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, (atividadeAberta.fases || []).map((f, i) => /*#__PURE__*/React.createElement("tr", {
      key: i
    }, /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, i + 1, ". ", f.fase), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, (f.riscos || []).map((r, ri) => /*#__PURE__*/React.createElement("div", {
      key: ri
    }, ri + 1, ". ", r))), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, (f.consequencias || []).map((c, ci) => /*#__PURE__*/React.createElement("div", {
      key: ci
    }, ci + 1, ". ", c))), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, (f.medidasIndividuais || []).map((m, mi) => /*#__PURE__*/React.createElement("div", {
      key: mi
    }, mi + 1, ". ", m))), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, (f.medidasColetivas || []).map((m, mi) => /*#__PURE__*/React.createElement("div", {
      key: mi
    }, mi + 1, ". ", m))))))), atividadeAberta.recomendacoesGerais && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        padding: 8,
        border: '1px solid #ccc'
      }
    }, /*#__PURE__*/React.createElement("b", null, "Recomenda\xE7\xF5es Gerais:"), " ", atividadeAberta.recomendacoesGerais)));
  })(), montagemPreviewOpen && (() => {
    const hoje = toISODate(new Date());
    const resp = getResponsavelDefaults();
    const numero = montagemHeader.numero || gerarNumeroAPR();
    const tdStyle = {
      border: '1px solid #999',
      padding: '6px 8px',
      verticalAlign: 'top'
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 20,
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        color: '#111',
        borderRadius: 8,
        padding: 24,
        maxWidth: 960,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        fontFamily: 'Arial, sans-serif',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 16
      }
    }, "PR\xC9VIA DO DOCUMENTO"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setMontagemPreviewOpen(false),
      style: {
        background: '#c0392b',
        border: 'none',
        color: '#fff',
        borderRadius: 6,
        padding: '6px 12px',
        cursor: 'pointer',
        fontFamily: "'Oswald',sans-serif",
        fontSize: 11,
        letterSpacing: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(XIcon, {
      size: 13
    }), "FECHAR")), /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: 12,
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "N\xFAmero da APR:"), " ", numero), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "Data:"), " ", isoToBR(hoje)), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "\xC1rea:"), " ", montagemHeader.area || '—')), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "Respons\xE1vel SESMT:"), " ", montagemHeader.responsavelSesmt || resp.responsavelSesmt || '—'), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "Fun\xE7\xE3o:"), " ", montagemHeader.funcao || resp.funcao || '—'), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "Assunto:"), " ", montagemHeader.assunto || '—')), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: tdStyle,
      colSpan: 2
    }, /*#__PURE__*/React.createElement("b", null, "In\xEDcio:"), " ", isoToBR(montagemHeader.dataInicio), " \xA0 ", /*#__PURE__*/React.createElement("b", null, "T\xE9rmino:"), " ", isoToBR(montagemHeader.dataTermino)), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, /*#__PURE__*/React.createElement("b", null, "Equipamentos:"), " ", montagemHeader.equipamentos || '—')), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: tdStyle,
      colSpan: 3
    }, /*#__PURE__*/React.createElement("b", null, "EPI's / E.P.C.s:"), " ", montagemHeader.epis || '—')))), /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, ['FASES DA OPERAÇÃO', 'RISCO DE ACIDENTE', 'CONSEQUÊNCIAS', 'MEDIDAS INDIVIDUAIS', 'MEDIDAS COLETIVAS'].map(h => /*#__PURE__*/React.createElement("th", {
      key: h,
      style: {
        ...tdStyle,
        background: '#2a2a2a',
        color: '#fff',
        textAlign: 'left'
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, orderedFases.map((f, i) => /*#__PURE__*/React.createElement("tr", {
      key: i
    }, /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, i + 1, ". ", f.fase), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, (f.riscos || []).map((r, ri) => /*#__PURE__*/React.createElement("div", {
      key: ri
    }, ri + 1, ". ", r))), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, (f.consequencias || []).map((c, ci) => /*#__PURE__*/React.createElement("div", {
      key: ci
    }, ci + 1, ". ", c))), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, (f.medidasIndividuais || []).map((m, mi) => /*#__PURE__*/React.createElement("div", {
      key: mi
    }, mi + 1, ". ", m))), /*#__PURE__*/React.createElement("td", {
      style: tdStyle
    }, (f.medidasColetivas || []).map((m, mi) => /*#__PURE__*/React.createElement("div", {
      key: mi
    }, mi + 1, ". ", m))))))), montagemHeader.recomendacoesGerais && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        padding: 8,
        border: '1px solid #ccc'
      }
    }, /*#__PURE__*/React.createElement("b", null, "Recomenda\xE7\xF5es Gerais:"), " ", montagemHeader.recomendacoesGerais)));
  })(), nivel === 'montar' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexDirection: 'row',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 250px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 10,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: buscaAvulsa,
    onChange: e => setBuscaAvulsa(e.target.value),
    placeholder: "Buscar fase (fase ou atividade)...",
    style: {
      flex: 1,
      minWidth: 80,
      background: '#111',
      border: '1px solid rgba(245,166,35,0.2)',
      borderRadius: 8,
      padding: '8px 10px',
      color: '#e8dcc8',
      fontSize: 12,
      outline: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 10,
      letterSpacing: 2,
      color: 'rgba(245,166,35,0.5)',
      textTransform: 'uppercase'
    }
  }, "Adicionar Fase"), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    onClick: adicionarFaseEmBranco,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(PlusIcon, {
    size: 12
  }), "EM BRANCO")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 10,
      letterSpacing: 2,
      color: 'rgba(245,166,35,0.3)',
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "\u2014 ou busque de outra atividade \u2014"), loading ? /*#__PURE__*/React.createElement("div", {
    className: "apr-empty"
  }, /*#__PURE__*/React.createElement(Spinner, null)) : !buscaAvulsa.trim() ? /*#__PURE__*/React.createElement("div", {
    className: "apr-empty"
  }, "DIGITE PARA BUSCAR", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.2)'
    }
  }, "Busque uma fase de qualquer atividade pra adicionar aqui")) : fasesAvulsasFiltradas.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "apr-empty"
  }, "NENHUMA FASE ENCONTRADA") : fasesAvulsasFiltradas.map((f, fi) => /*#__PURE__*/React.createElement("div", {
    key: fi,
    className: "apr-card",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 12,
      color: '#e8dcc8'
    }
  }, f.fase), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.3)'
    }
  }, f._atividadeNome, " \xB7 ", (f.riscos || []).length, " riscos")), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    onClick: () => adicionarFaseAvulsa(f, f._atividadeNome)
  }, /*#__PURE__*/React.createElement(PlusIcon, {
    size: 11
  }), "ADICIONAR")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 280px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: buscaEscolher,
    onChange: e => setBuscaEscolher(e.target.value),
    placeholder: "Escolher atividade pronta (carrega todas as fases)...",
    style: {
      width: '100%',
      background: '#111',
      border: '1px solid rgba(245,166,35,0.3)',
      borderRadius: 8,
      padding: '10px 12px',
      color: '#e8dcc8',
      fontSize: 13,
      outline: 'none'
    }
  }), opcoesEscolher.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, opcoesEscolher.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    className: "apr-card",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontFamily: "'Oswald',sans-serif",
      fontSize: 12,
      color: '#e8dcc8'
    }
  }, a.nome, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.3)'
    }
  }, "(", (a.fases || []).length, " fases)")), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    onClick: () => escolherAtividade(a)
  }, /*#__PURE__*/React.createElement(UploadIcon, {
    size: 11
  }), "CARREGAR"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(245,166,35,0.12)',
      borderRadius: 10,
      padding: '12px 14px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Cabe\xE7alho da APR"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nome da APR"
  }, /*#__PURE__*/React.createElement("input", {
    value: montagemNome,
    onChange: e => setMontagemNome(e.target.value),
    placeholder: "Ex: Alvenaria"
  })), /*#__PURE__*/React.createElement("div", {
    className: "apr-grid"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "N\xFAmero da APR (autom\xE1tico)"
  }, /*#__PURE__*/React.createElement("input", {
    value: montagemHeader.numero,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      numero: e.target.value
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\xC1rea"
  }, /*#__PURE__*/React.createElement("input", {
    value: montagemHeader.area,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      area: e.target.value
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Respons\xE1vel SESMT"
  }, /*#__PURE__*/React.createElement("input", {
    value: montagemHeader.responsavelSesmt,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      responsavelSesmt: e.target.value
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Fun\xE7\xE3o"
  }, /*#__PURE__*/React.createElement("input", {
    value: montagemHeader.funcao,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      funcao: e.target.value
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Assunto / Trabalho"
  }, /*#__PURE__*/React.createElement("input", {
    value: montagemHeader.assunto,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      assunto: e.target.value
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Local"
  }, /*#__PURE__*/React.createElement("input", {
    value: montagemHeader.local,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      local: e.target.value
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Data de In\xEDcio"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: montagemHeader.dataInicio,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      dataInicio: e.target.value,
      dataTermino: addDaysISO(e.target.value, 30)
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "T\xE9rmino (in\xEDcio + 30 dias)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: montagemHeader.dataTermino,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      dataTermino: e.target.value
    }))
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Equipamentos e acess\xF3rios utilizados"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: montagemHeader.equipamentos,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      equipamentos: e.target.value
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "EPI's / E.P.C.s"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: montagemHeader.epis,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      epis: e.target.value
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Recomenda\xE7\xF5es Gerais"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: montagemHeader.recomendacoesGerais,
    onChange: e => setMontagemHeader(h => ({
      ...h,
      recomendacoesGerais: e.target.value
    }))
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 11,
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1
    }
  }, orderedFases.length, " fase(s)"), orderedFases.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-outline",
    onClick: () => setMontagemPreviewOpen(true)
  }, /*#__PURE__*/React.createElement(EyeIcon, {
    size: 16
  }), "PR\xC9VIA"), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-outline",
    onClick: () => {
      let texto = montagemNome ? `APR: ${montagemNome.toUpperCase()}\n${'='.repeat(40)}\n` : '';
      orderedFases.forEach((f, i) => {
        texto += `\n${i + 1}. ${f.fase}\n`;
        if (f.riscos.length) {
          texto += '   Riscos:\n';
          f.riscos.forEach((r, j) => texto += `     ${j + 1}. ${r}\n`);
        }
        if (f.consequencias.length) {
          texto += '   Consequências:\n';
          f.consequencias.forEach((c, j) => texto += `     ${j + 1}. ${c}\n`);
        }
        if (f.medidasIndividuais.length) {
          texto += '   Medidas Individuais:\n';
          f.medidasIndividuais.forEach((m, j) => texto += `     ${j + 1}. ${m}\n`);
        }
        if (f.medidasColetivas.length) {
          texto += '   Medidas Coletivas:\n';
          f.medidasColetivas.forEach((m, j) => texto += `     ${j + 1}. ${m}\n`);
        }
      });
      navigator.clipboard.writeText(texto).then(() => {
        const btn = document.activeElement;
        if (btn) btn.textContent = 'COPIADO!';
        setTimeout(() => {
          if (btn) btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> COPIAR`;
        }, 1500);
      });
    }
  }, /*#__PURE__*/React.createElement(ClipboardIcon, null), "COPIAR"), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-outline",
    onClick: () => gerarDocxAPR({
      nome: montagemNome,
      ...montagemHeader,
      fases: orderedFases
    })
  }, /*#__PURE__*/React.createElement(DownloadIcon, {
    size: 16
  }), "EXPORTAR DOCX"), /*#__PURE__*/React.createElement("button", {
    className: "apr-btn",
    onClick: saveMontagem
  }, /*#__PURE__*/React.createElement(CheckIcon, {
    size: 16
  }), "SALVAR"))), orderedFases.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "apr-empty"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "28",
    height: "28",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    fillOpacity: "0.1",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "14 2 14 8 20 8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "18",
    x2: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "15",
    x2: "15",
    y2: "15"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, "ESCOLHA UMA ATIVIDADE OU ADICIONE FASES AVULSAS")) : /*#__PURE__*/React.createElement("div", null, orderedFases.map((f, i) => {
    const expanded = expandedFases.has(f._uid);
    return /*#__PURE__*/React.createElement("div", {
      key: f._uid,
      style: {
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(245,166,35,0.12)',
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(192,57,43,0.1)',
        padding: '8px 10px',
        borderBottom: expanded ? '1px solid rgba(245,166,35,0.1)' : 'none',
        cursor: 'pointer'
      },
      onClick: () => toggleExpandFase(f._uid)
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'Oswald',sans-serif",
        fontWeight: 700,
        fontSize: 13,
        color: '#c0392b',
        width: 20
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Oswald',sans-serif",
        fontSize: 12,
        color: '#f5c518',
        letterSpacing: 1
      }
    }, f.fase), !expanded && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.35)',
        marginTop: 2
      }
    }, f.riscos.length, " riscos \xB7 ", f.consequencias.length, " consequ\xEAncias \xB7 ", f.medidasIndividuais.length, " medidas individuais \xB7 ", f.medidasColetivas.length, " medidas coletivas")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 3
      },
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("button", {
      className: "apr-btn-sm",
      onClick: () => startEditMontagemFase(i),
      style: {
        padding: '3px 7px'
      }
    }, /*#__PURE__*/React.createElement(EditIcon, {
      size: 11
    }), "EDITAR"), /*#__PURE__*/React.createElement("button", {
      className: "apr-btn-sm",
      onClick: () => moveUp(i),
      disabled: i === 0,
      style: {
        opacity: i === 0 ? 0.3 : 1,
        padding: '3px 7px'
      }
    }, /*#__PURE__*/React.createElement(ArrowUpIcon, {
      size: 11
    })), /*#__PURE__*/React.createElement("button", {
      className: "apr-btn-sm",
      onClick: () => moveDown(i),
      disabled: i === orderedFases.length - 1,
      style: {
        opacity: i === orderedFases.length - 1 ? 0.3 : 1,
        padding: '3px 7px'
      }
    }, /*#__PURE__*/React.createElement(ArrowDownIcon, {
      size: 11
    })), /*#__PURE__*/React.createElement("button", {
      className: "apr-btn-sm",
      style: {
        color: '#e74c3c',
        borderColor: 'rgba(231,76,60,0.3)',
        padding: '3px 7px'
      },
      onClick: () => removerFase(i)
    }, /*#__PURE__*/React.createElement(XIcon, {
      size: 11
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.4)',
        transform: expanded ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.15s',
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement(ChevronDown, null))), expanded && /*#__PURE__*/React.createElement("div", {
      className: "apr-grid",
      style: {
        padding: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#f5c518',
        fontFamily: "'Oswald',sans-serif",
        letterSpacing: 1,
        marginBottom: 4
      }
    }, "RISCOS DE ACIDENTE"), f.riscos.map((r, ri) => /*#__PURE__*/React.createElement("div", {
      key: ri,
      className: "apr-risco-item"
    }, ri + 1, ". ", r))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#f5c518',
        fontFamily: "'Oswald',sans-serif",
        letterSpacing: 1,
        marginBottom: 4
      }
    }, "CONSEQU\xCANCIAS"), f.consequencias.map((c, ci) => /*#__PURE__*/React.createElement("div", {
      key: ci,
      className: "apr-risco-item"
    }, ci + 1, ". ", c))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#f5c518',
        fontFamily: "'Oswald',sans-serif",
        letterSpacing: 1,
        marginBottom: 4
      }
    }, "MEDIDAS INDIVIDUAIS"), f.medidasIndividuais.map((m, mi) => /*#__PURE__*/React.createElement("div", {
      key: mi,
      className: "apr-risco-item"
    }, mi + 1, ". ", m))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#f5c518',
        fontFamily: "'Oswald',sans-serif",
        letterSpacing: 1,
        marginBottom: 4
      }
    }, "MEDIDAS COLETIVAS"), f.medidasColetivas.map((m, mi) => /*#__PURE__*/React.createElement("div", {
      key: mi,
      className: "apr-risco-item"
    }, mi + 1, ". ", m)))));
  })))), nivel === 'historico' && /*#__PURE__*/React.createElement("div", null, loading ? /*#__PURE__*/React.createElement("div", {
    className: "apr-empty"
  }, /*#__PURE__*/React.createElement(Spinner, null)) : historicoItens.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "apr-empty"
  }, "NENHUM REGISTRO NO HIST\xD3RICO") : historicoItens.map((item, idx) => item._tipo === 'montagem' ? /*#__PURE__*/React.createElement("div", {
    key: 'm' + item.id,
    className: "apr-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "apr-card-header"
  }, /*#__PURE__*/React.createElement("span", null, item.nome || 'Sem nome'), /*#__PURE__*/React.createElement("span", {
    className: "apr-badge"
  }, (item.fases || []).length, " fases")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.4)',
      marginBottom: 8
    }
  }, "APR salva \xB7 ", item.autorNome, " \u2022 ", (item.criada_em ? new Date(item.criada_em) : new Date()).toLocaleDateString?.('pt-BR') || new Date().toLocaleDateString('pt-BR')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    style: {
      color: '#e74c3c',
      borderColor: 'rgba(231,76,60,0.3)'
    },
    onClick: () => setConfirmDel(item.id)
  }, /*#__PURE__*/React.createElement(TrashIcon, {
    size: 12
  }), "EXCLUIR"))) : /*#__PURE__*/React.createElement("div", {
    key: 'l' + item.id,
    className: "apr-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "apr-card-header"
  }, /*#__PURE__*/React.createElement("span", null, item.tipo), /*#__PURE__*/React.createElement("span", {
    className: "apr-badge"
  }, item.atividadeNome)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.4)',
      marginBottom: item.antes && !item.revertido ? 8 : 0
    }
  }, "Fase: ", item.faseNome, " \xB7 ", item.autorNome, " \u2022 ", (item.criada_em ? new Date(item.criada_em) : new Date()).toLocaleDateString?.('pt-BR') || new Date().toLocaleDateString('pt-BR')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, item.revertido ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.3)',
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1
    }
  }, "ALTERA\xC7\xC3O DESFEITA") : item.antes ? /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    onClick: () => desfazerAlteracao(item)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "9 14 4 9 9 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 20v-7a4 4 0 0 0-4-4H4"
  })), "DESFAZER") : null, /*#__PURE__*/React.createElement("button", {
    className: "apr-btn-sm",
    style: {
      color: '#e74c3c',
      borderColor: 'rgba(231,76,60,0.3)'
    },
    onClick: () => handleDeleteLog(item.id)
  }, /*#__PURE__*/React.createElement(TrashIcon, {
    size: 12
  }), "EXCLUIR")))))), editCtx && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: 20,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#111',
      border: '1px solid rgba(245,166,35,0.2)',
      borderRadius: 16,
      padding: 24,
      maxWidth: 560,
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 16,
      color: '#fff',
      letterSpacing: 1,
      marginBottom: 16
    }
  }, "EDITAR FASE"), /*#__PURE__*/React.createElement(Field, {
    label: "Nome da Fase"
  }, /*#__PURE__*/React.createElement("input", {
    value: editForm.fase,
    onChange: e => setEditForm(f => ({
      ...f,
      fase: e.target.value
    })),
    placeholder: "Nome da fase"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(ParagraphListEditor, {
    label: "RISCOS DE ACIDENTE",
    items: editForm.riscos,
    onChange: v => setEditForm(f => ({
      ...f,
      riscos: v
    }))
  }), /*#__PURE__*/React.createElement(ParagraphListEditor, {
    label: "CONSEQU\xCANCIAS",
    items: editForm.consequencias,
    onChange: v => setEditForm(f => ({
      ...f,
      consequencias: v
    }))
  }), /*#__PURE__*/React.createElement(ParagraphListEditor, {
    label: "MEDIDAS INDIVIDUAIS",
    items: editForm.medidasIndividuais,
    onChange: v => setEditForm(f => ({
      ...f,
      medidasIndividuais: v
    }))
  }), /*#__PURE__*/React.createElement(ParagraphListEditor, {
    label: "MEDIDAS COLETIVAS",
    items: editForm.medidasColetivas,
    onChange: v => setEditForm(f => ({
      ...f,
      medidasColetivas: v
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditCtx(null),
    style: {
      flex: 1,
      background: 'transparent',
      border: '1px solid rgba(232,220,200,0.2)',
      color: 'rgba(255,255,255,0.6)',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 12
  }), "CANCELAR"), /*#__PURE__*/React.createElement("button", {
    onClick: handleEditSave,
    style: {
      flex: 2,
      background: 'rgba(192,57,43,0.8)',
      border: 'none',
      color: '#fff',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(SaveIcon, {
    size: 13
  }), "SALVAR ALTERA\xC7\xD5ES")))), editMontagemIdx !== null && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: 20,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#111',
      border: '1px solid rgba(245,166,35,0.2)',
      borderRadius: 16,
      padding: 24,
      maxWidth: 560,
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 16,
      color: '#fff',
      letterSpacing: 1,
      marginBottom: 16
    }
  }, "EDITAR FASE DA MONTAGEM"), /*#__PURE__*/React.createElement(Field, {
    label: "Nome da Fase"
  }, /*#__PURE__*/React.createElement("input", {
    value: editMontagemForm.fase,
    onChange: e => setEditMontagemForm(f => ({
      ...f,
      fase: e.target.value
    })),
    placeholder: "Nome da fase"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(ParagraphListEditor, {
    label: "RISCOS DE ACIDENTE",
    items: editMontagemForm.riscos,
    onChange: v => setEditMontagemForm(f => ({
      ...f,
      riscos: v
    }))
  }), /*#__PURE__*/React.createElement(ParagraphListEditor, {
    label: "CONSEQU\xCANCIAS",
    items: editMontagemForm.consequencias,
    onChange: v => setEditMontagemForm(f => ({
      ...f,
      consequencias: v
    }))
  }), /*#__PURE__*/React.createElement(ParagraphListEditor, {
    label: "MEDIDAS INDIVIDUAIS",
    items: editMontagemForm.medidasIndividuais,
    onChange: v => setEditMontagemForm(f => ({
      ...f,
      medidasIndividuais: v
    }))
  }), /*#__PURE__*/React.createElement(ParagraphListEditor, {
    label: "MEDIDAS COLETIVAS",
    items: editMontagemForm.medidasColetivas,
    onChange: v => setEditMontagemForm(f => ({
      ...f,
      medidasColetivas: v
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditMontagemIdx(null),
    style: {
      flex: 1,
      background: 'transparent',
      border: '1px solid rgba(232,220,200,0.2)',
      color: 'rgba(255,255,255,0.6)',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 12
  }), "CANCELAR"), /*#__PURE__*/React.createElement("button", {
    onClick: handleEditMontagemSave,
    style: {
      flex: 2,
      background: 'rgba(192,57,43,0.8)',
      border: 'none',
      color: '#fff',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(SaveIcon, {
    size: 13
  }), "SALVAR ALTERA\xC7\xD5ES")))), confirmDel && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#111',
      border: '1px solid rgba(245,166,35,0.2)',
      borderRadius: 16,
      padding: 24,
      maxWidth: 300,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 16,
      color: '#fff',
      letterSpacing: 1,
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(AlertIcon, null), "EXCLUIR APR?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.5)',
      marginBottom: 20
    }
  }, "Esta a\xE7\xE3o n\xE3o pode ser desfeita."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmDel(null),
    style: {
      flex: 1,
      background: 'transparent',
      border: '1px solid rgba(232,220,200,0.2)',
      color: 'rgba(255,255,255,0.6)',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 12
  }), "CANCELAR"), /*#__PURE__*/React.createElement("button", {
    onClick: () => deleteMontagem(confirmDel),
    style: {
      flex: 1,
      background: 'rgba(192,57,43,0.8)',
      border: 'none',
      color: '#fff',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(TrashIcon, {
    size: 14
  }), "EXCLUIR")))), confirmDelAtividade && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#111',
      border: '1px solid rgba(245,166,35,0.2)',
      borderRadius: 16,
      padding: 24,
      maxWidth: 300,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 16,
      color: '#fff',
      letterSpacing: 1,
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(AlertIcon, null), "EXCLUIR ATIVIDADE?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.5)',
      marginBottom: 20
    }
  }, "Todas as fases desta atividade ser\xE3o removidas. Esta a\xE7\xE3o n\xE3o pode ser desfeita."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmDelAtividade(null),
    style: {
      flex: 1,
      background: 'transparent',
      border: '1px solid rgba(232,220,200,0.2)',
      color: 'rgba(255,255,255,0.6)',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(XIcon, {
    size: 12
  }), "CANCELAR"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeleteAtividade(confirmDelAtividade),
    style: {
      flex: 1,
      background: 'rgba(192,57,43,0.8)',
      border: 'none',
      color: '#fff',
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: '10px',
      borderRadius: 8,
      cursor: 'pointer',
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
