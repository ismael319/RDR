// ── APP ROOT ──
function App() {
  const [user, setUser] = useState(() => session.get());
  const [screen, setScreen] = useState("home");
  const [viewData, setViewData] = useState(null);
  const [filtroInicial, setFiltroInicial] = useState({});
  const [periodoSelecionado, setPeriodoSelecionado] = useState(null);
  const [prevScreen, setPrevScreen] = useState("registros");
  function handleLogin(u) {
    setUser(u);
    setScreen("home");
  }
  function handleLogout() {
    session.clear();
    setUser(null);
    setScreen("home");
  }
  function handleView(r) {
    setViewData(r);
    setPrevScreen(screen);
    setScreen("view");
  }
  function handleVerRegistros(filtro) {
    setFiltroInicial(filtro);
    setScreen("registros-dash");
  }
  function handleVerPeriodo(periodo) {
    setPeriodoSelecionado(periodo);
    setScreen("registros-periodo");
  }
  function voltarView() {
    if (prevScreen === "registros-dash") setScreen("registros-dash");else if (prevScreen === "registros-periodo") setScreen("registros-periodo");else setScreen("registros");
  }
  useEffect(() => {
    if (user) fsdb.sincronizar();
  }, [user && user.id]);
  if (!user) return /*#__PURE__*/React.createElement(LoginScreen, {
    onLogin: handleLogin
  });
  const backAlvo = user.role === 'gestor' ? "campo" : "home";
  let tela = null;
  if (screen === "home") tela = /*#__PURE__*/React.createElement(HomeScreen, {
    user: user,
    onNew: () => setScreen("form"),
    onRegistros: handleVerPeriodo,
    onGestor: () => setScreen("gestor"),
    onApr: () => setScreen("apr"),
    onCampo: () => setScreen("campo"),
    onDashboard: () => setScreen("dashboard"),
    onLogout: handleLogout,
    onVerTodos: () => setScreen("registros"),
    onCertificados: () => setScreen("certificados")
  });
  if (screen === "campo" && user.role === 'gestor') tela = /*#__PURE__*/React.createElement(CampoHubScreen, {
    user: user,
    onNew: () => setScreen("form"),
    onRegistros: handleVerPeriodo,
    onGestor: () => setScreen("gestor"),
    onDashboard: () => setScreen("dashboard"),
    onVerTodos: () => setScreen("registros"),
    onBack: () => setScreen("home")
  });
  if (screen === "form") tela = /*#__PURE__*/React.createElement(FormScreen, {
    user: user,
    onBack: () => setScreen(backAlvo),
    onSaved: () => setScreen(backAlvo),
    editData: null
  });
  if (screen === "registros") tela = /*#__PURE__*/React.createElement(RegistrosScreen, {
    user: user,
    onBack: () => setScreen(backAlvo),
    onView: handleView
  });
  if (screen === "registros-periodo") tela = /*#__PURE__*/React.createElement(RegistrosScreen, {
    user: user,
    onBack: () => setScreen(backAlvo),
    onView: handleView,
    periodo: periodoSelecionado,
    modoSimples: true
  });
  if (screen === "registros-dash") tela = /*#__PURE__*/React.createElement(RegistrosScreen, {
    user: user,
    onBack: () => setScreen("dashboard"),
    onView: handleView,
    filtroInicial: filtroInicial
  });
  if (screen === "view") tela = /*#__PURE__*/React.createElement(FormScreen, {
    user: user,
    onBack: voltarView,
    onSaved: voltarView,
    editData: viewData
  });
  if (screen === "gestor" && user.role === 'gestor') tela = /*#__PURE__*/React.createElement(GestorScreen, {
    user: user,
    onBack: () => setScreen(backAlvo)
  });
  if (screen === "apr" && user.role === 'gestor') tela = /*#__PURE__*/React.createElement(AprScreen, {
    user: user,
    onBack: () => setScreen("home")
  });
  if (screen === "certificados" && user.role === 'gestor') tela = /*#__PURE__*/React.createElement(CertificadosScreen, {
    user: user,
    onBack: () => setScreen("home")
  });
  if (screen === "dashboard" && user.role !== 'tecnico' && user.role !== 'engcivil') tela = /*#__PURE__*/React.createElement(DashboardScreen, {
    onBack: () => setScreen(backAlvo),
    onVerRegistros: handleVerRegistros
  });
  if (!tela) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(OfflineBadge, null), tela);
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
