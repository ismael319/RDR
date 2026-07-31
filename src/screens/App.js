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
  if (!user) return /*#__PURE__*/React.createElement(LoginScreen, {
    onLogin: handleLogin
  });
  const backAlvo = user.role === 'gestor' ? "campo" : "home";
  if (screen === "home") return /*#__PURE__*/React.createElement(HomeScreen, {
    user: user,
    onNew: () => setScreen("form"),
    onRegistros: handleVerPeriodo,
    onGestor: () => setScreen("gestor"),
    onApr: () => setScreen("apr"),
    onCampo: () => setScreen("campo"),
    onDashboard: () => setScreen("dashboard"),
    onLogout: handleLogout,
    onVerTodos: () => setScreen("registros")
  });
  if (screen === "campo" && user.role === 'gestor') return /*#__PURE__*/React.createElement(CampoHubScreen, {
    user: user,
    onNew: () => setScreen("form"),
    onRegistros: handleVerPeriodo,
    onGestor: () => setScreen("gestor"),
    onDashboard: () => setScreen("dashboard"),
    onVerTodos: () => setScreen("registros"),
    onBack: () => setScreen("home")
  });
  if (screen === "form") return /*#__PURE__*/React.createElement(FormScreen, {
    user: user,
    onBack: () => setScreen(backAlvo),
    onSaved: () => setScreen(backAlvo),
    editData: null
  });
  if (screen === "registros") return /*#__PURE__*/React.createElement(RegistrosScreen, {
    user: user,
    onBack: () => setScreen(backAlvo),
    onView: handleView
  });
  if (screen === "registros-periodo") return /*#__PURE__*/React.createElement(RegistrosScreen, {
    user: user,
    onBack: () => setScreen(backAlvo),
    onView: handleView,
    periodo: periodoSelecionado,
    modoSimples: true
  });
  if (screen === "registros-dash") return /*#__PURE__*/React.createElement(RegistrosScreen, {
    user: user,
    onBack: () => setScreen("dashboard"),
    onView: handleView,
    filtroInicial: filtroInicial
  });
  if (screen === "view") return /*#__PURE__*/React.createElement(FormScreen, {
    user: user,
    onBack: voltarView,
    onSaved: voltarView,
    editData: viewData
  });
  if (screen === "gestor" && user.role === 'gestor') return /*#__PURE__*/React.createElement(GestorScreen, {
    user: user,
    onBack: () => setScreen(backAlvo)
  });
  if (screen === "apr" && user.role === 'gestor') return /*#__PURE__*/React.createElement(AprScreen, {
    user: user,
    onBack: () => setScreen("home")
  });
  if (screen === "dashboard" && user.role !== 'tecnico' && user.role !== 'engcivil') return /*#__PURE__*/React.createElement(DashboardScreen, {
    onBack: () => setScreen(backAlvo),
    onVerRegistros: handleVerRegistros
  });
  return null;
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
