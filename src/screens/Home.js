// ── HOME ──
function HomeScreen({
  user,
  onNew,
  onRegistros,
  onGestor,
  onApr,
  onCampo,
  onDashboard,
  onLogout,
  onVerTodos
}) {
  const [stats, setStats] = useState({
    hoje: 0,
    mes: 0,
    total: 0
  });
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  const hojeKey = new Date().toLocaleDateString('en-CA');
  const mesKey = hojeKey.slice(0, 7);
  useEffect(() => {
    const unsubscribe = fsdb.subscribeRecords(recs => {
      const dados = ROLES_SOMENTE_PROPRIOS.includes(user.role) ? recs.filter(r => r.autorId === user.id) : recs;
      setStats({
        hoje: dados.filter(r => r.dataOcorrido === hojeKey).length,
        mes: dados.filter(r => r.dataOcorrido?.slice(0, 7) === mesKey).length,
        total: dados.length
      });
    });
    return () => unsubscribe();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#000000"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#000000",
      borderBottom: "2px solid #c0392b",
      padding: "0 18px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      overflow: "visible"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO_SRC,
    alt: "BDR",
    style: {
      height: 130,
      width: "auto"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    style: {
      background: "rgba(192,57,43,0.15)",
      border: "1px solid rgba(192,57,43,0.4)",
      color: "#e74c3c",
      borderRadius: 8,
      padding: "6px 12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11,
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1
    }
  }, /*#__PURE__*/React.createElement(LogoutIcon, null), "SAIR")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20,
      paddingBottom: 16,
      borderBottom: "1px solid rgba(192,57,43,0.25)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "rgba(255,255,255,0.4)",
      fontStyle: "italic",
      textTransform: "capitalize",
      marginBottom: 8
    }
  }, today), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      background: "rgba(192,57,43,0.15)",
      border: "2px solid #c0392b",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#c0392b",
      flexShrink: 0
    }
  }, user.role === 'gestor' || user.role === 'gestorobra' ? /*#__PURE__*/React.createElement(ShieldIcon, null) : /*#__PURE__*/React.createElement(UserIcon, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 18,
      color: "#ffffff",
      fontWeight: 700,
      letterSpacing: 1
    }
  }, "Ol\xE1, ", user.nome), user.role === 'gestor' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      background: "rgba(192,57,43,0.2)",
      color: "#c0392b",
      border: "1px solid rgba(192,57,43,0.4)",
      borderRadius: 10,
      padding: "2px 8px",
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1
    }
  }, "GESTOR SSMA") : user.role === 'gestorobra' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      background: "rgba(39,174,96,0.2)",
      color: "#27ae60",
      border: "1px solid rgba(39,174,96,0.4)",
      borderRadius: 10,
      padding: "2px 8px",
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1
    }
  }, "GERENTE DE CONTRATO") : null))), user.role === 'gestor' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      marginTop: "12vh",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(FolderTile, {
    label: "Registros de Campo",
    sub: "RDR e dashboard",
    icon: /*#__PURE__*/React.createElement(FolderIcon, null),
    color: "#f5c518",
    onClick: onCampo
  }), /*#__PURE__*/React.createElement(FolderTile, {
    label: "APR",
    sub: "An\xE1lise Preliminar",
    icon: /*#__PURE__*/React.createElement(DocumentIcon, {
      size: 26
    }),
    color: "#ffffff",
    onClick: onApr
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 10,
      marginBottom: 20
    }
  }, [["Hoje", stats.hoje, "#f5c518", () => onRegistros("hoje"), /*#__PURE__*/React.createElement(ClockIcon, null)], ["Mês", stats.mes, "#c0392b", () => onRegistros("mes"), /*#__PURE__*/React.createElement(CalendarIcon, null)], ["Total", stats.total, "#ffffff", () => onVerTodos?.(), /*#__PURE__*/React.createElement(DocumentIcon, {
    size: 16
  })]].map(([label, val, cor, onClick, ic]) => /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: onClick,
    style: {
      "--glow": cor,
      border: `1px solid ${cor}40`,
      borderRadius: 12,
      padding: "14px 10px",
      textAlign: "center",
      cursor: "pointer",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "folder-tile-fx-scan"
  }), /*#__PURE__*/React.createElement("span", {
    className: "folder-tile-fx-icon",
    style: {
      color: cor
    }
  }, ic), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      fontSize: 28,
      fontWeight: 700,
      fontFamily: "'Oswald',sans-serif",
      color: cor
    }
  }, val), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      fontSize: 10,
      color: "rgba(255,255,255,0.4)",
      letterSpacing: 1,
      fontFamily: "'Oswald',sans-serif",
      textTransform: "uppercase"
    }
  }, label)))), /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: onNew,
    style: {
      "--glow": "#c0392b",
      width: "100%",
      background: "linear-gradient(135deg,#c0392b,#96281b)",
      border: "none",
      borderRadius: 16,
      padding: "20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 12,
      boxShadow: "0 8px 32px rgba(192,57,43,0.4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "folder-tile-fx-scan"
  }), /*#__PURE__*/React.createElement("div", {
    className: "folder-tile-fx-icon",
    style: {
      position: "relative",
      zIndex: 1,
      width: 46,
      height: 46,
      background: "rgba(255,255,255,0.2)",
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(PlusIcon, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 17,
      color: "#ffffff",
      letterSpacing: 1
    }
  }, "NOVO REGISTRO"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "rgba(255,255,255,0.7)",
      marginTop: 2
    }
  }, "Criar novo RDR agora"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 11,
      letterSpacing: 2,
      color: "rgba(255,255,255,0.4)",
      textTransform: "uppercase",
      marginBottom: 8,
      paddingLeft: 2
    }
  }, ROLES_SOMENTE_PROPRIOS.includes(user.role) ? "Meus Registros" : "Todos os Registros"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 8
    }
  }, [["Hoje", "hoje"], ["Semana", "semana"], ["Mês", "mes"]].map(([label, periodo]) => /*#__PURE__*/React.createElement("button", {
    key: periodo,
    className: "folder-tile-fx",
    onClick: () => onRegistros(periodo),
    style: {
      "--glow": "#f5c518",
      background: "#111111",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      padding: "14px 8px",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      color: "#ffffff"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "folder-tile-fx-scan"
  }), /*#__PURE__*/React.createElement("span", {
    className: "folder-tile-fx-icon",
    style: {
      color: "#f5c518"
    }
  }, /*#__PURE__*/React.createElement(FolderIcon, null)), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      zIndex: 1,
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 600,
      fontSize: 12,
      letterSpacing: 1
    }
  }, label))))), user.role !== 'tecnico' && user.role !== 'engcivil' && /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: onDashboard,
    style: {
      "--glow": "#27ae60",
      width: "100%",
      background: "rgba(39,174,96,0.08)",
      border: "1px solid rgba(39,174,96,0.3)",
      borderRadius: 16,
      padding: "18px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "folder-tile-fx-scan"
  }), /*#__PURE__*/React.createElement("div", {
    className: "folder-tile-fx-icon",
    style: {
      position: "relative",
      zIndex: 1,
      width: 46,
      height: 46,
      background: "rgba(39,174,96,0.15)",
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color: "#27ae60"
    }
  }, /*#__PURE__*/React.createElement(DashboardIcon, {
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      textAlign: "left",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 600,
      fontSize: 15,
      color: "#27ae60",
      letterSpacing: 1
    }
  }, "DASHBOARD"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "rgba(255,255,255,0.5)",
      marginTop: 2
    }
  }, "Indicadores, gr\xE1ficos e exporta\xE7\xE3o")), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement(ChevronRight, null))))));
}
