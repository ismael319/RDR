// ── LOGIN ──
function LoginScreen({
  onLogin
}) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleLogin() {
    if (!usuario || !senha) {
      setErro('Preencha usuário e senha.');
      return;
    }
    setLoading(true);
    setErro('');
    try {
      const user = await fsdb.findUser(usuario, senha);
      if (user) {
        session.set(user);
        onLogin(user);
      } else {
        setErro('Usuário ou senha incorretos.');
      }
    } catch (e) {
      setErro('Erro de conexão. Verifique a internet.');
    }
    setLoading(false);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#000000",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "login-card",
    style: {
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO_SRC,
    alt: "BDR",
    style: {
      height: 130,
      width: "auto"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 2,
      background: "#c0392b",
      margin: "10px auto 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 10,
      letterSpacing: 4,
      color: "rgba(255,255,255,0.35)",
      textTransform: "uppercase",
      marginTop: 10
    }
  }, "Seguran\xE7a do Trabalho")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#111111",
      border: "1px solid rgba(192,57,43,0.4)",
      borderRadius: 16,
      padding: "28px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      letterSpacing: 3,
      color: "#f5c518",
      marginBottom: 24,
      textTransform: "uppercase",
      borderLeft: "3px solid #c0392b",
      paddingLeft: 10
    }
  }, "Acesso ao Sistema"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Usu\xE1rio"
  }, /*#__PURE__*/React.createElement("input", {
    value: usuario,
    onChange: e => {
      setUsuario(e.target.value);
      setErro('');
    },
    placeholder: "Seu usu\xE1rio",
    onKeyDown: e => e.key === 'Enter' && handleLogin()
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Senha"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: senha,
    onChange: e => {
      setSenha(e.target.value);
      setErro('');
    },
    placeholder: "Sua senha",
    onKeyDown: e => e.key === 'Enter' && handleLogin()
  }))), erro && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(192,57,43,0.15)",
      border: "1px solid rgba(192,57,43,0.3)",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 13,
      color: "#e74c3c",
      marginBottom: 16
    }
  }, erro), /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: handleLogin,
    disabled: loading,
    style: {
      "--glow": "#f5c518",
      width: "100%",
      background: loading ? "rgba(100,100,100,0.5)" : "linear-gradient(135deg,#c0392b,#96281b)",
      border: "none",
      borderRadius: 10,
      padding: "15px",
      color: "#ffffff",
      boxShadow: "0 4px 24px rgba(192,57,43,0.4)",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 16,
      letterSpacing: 2,
      cursor: loading ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, !loading && /*#__PURE__*/React.createElement(LoginIcon, null), loading ? "VERIFICANDO..." : "ENTRAR")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 11,
      color: "rgba(255,255,255,0.25)",
      fontStyle: "italic"
    }
  }, "Primeiro acesso? Contate o gestor.")));
}
