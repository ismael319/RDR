function SectionLabel({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 10,
      letterSpacing: 3,
      color: "#f5c518",
      textTransform: "uppercase",
      marginBottom: 12,
      borderLeft: "2px solid #f5a623",
      paddingLeft: 8
    }
  }, children);
}
function Field({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      letterSpacing: 1.5,
      color: "rgba(192,57,43,0.7)",
      textTransform: "uppercase",
      marginBottom: 4,
      fontFamily: "'Oswald',sans-serif"
    }
  }, label), children);
}
function Header({
  title,
  subtitle,
  onBack,
  onLogout,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#000000",
      borderBottom: "2px solid #c0392b",
      padding: "14px 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      backdropFilter: "blur(10px)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, onBack && /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: onBack,
    style: {
      "--glow": "#c0392b",
      background: "none",
      border: "none",
      borderRadius: 8,
      color: "#c0392b",
      cursor: "pointer",
      padding: 4,
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(BackIcon, null)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 16,
      color: "#ffffff",
      letterSpacing: 2
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "rgba(255,255,255,0.4)",
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1
    }
  }, subtitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, right, onLogout && /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: onLogout,
    style: {
      "--glow": "#e74c3c",
      background: "rgba(192,57,43,0.15)",
      border: "1px solid rgba(192,57,43,0.2)",
      color: "#e74c3c",
      borderRadius: 8,
      padding: "6px 10px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11,
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1
    }
  }, /*#__PURE__*/React.createElement(LogoutIcon, null), "SAIR")));
}
function Spinner() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      border: "3px solid rgba(192,57,43,0.2)",
      borderTop: "3px solid #c0392b",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    }
  }), /*#__PURE__*/React.createElement("style", null, `@keyframes spin{to{transform:rotate(360deg)}}`));
}
function FolderTile({
  label,
  sub,
  icon,
  color,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "folder-tile-fx",
    onClick: onClick,
    style: {
      "--glow": color,
      border: `1px solid ${color}40`,
      borderRadius: 20,
      padding: "30px 14px",
      cursor: "pointer",
      width: 150,
      boxShadow: `0 8px 24px ${color}22`
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "folder-tile-fx-scan"
  }), /*#__PURE__*/React.createElement("div", {
    className: "folder-tile-fx-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "folder-tile-fx-icon",
    style: {
      width: 64,
      height: 64,
      background: `${color}20`,
      borderRadius: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: color
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 13,
      color: "#ffffff",
      letterSpacing: 1,
      textTransform: "uppercase"
    }
  }, label), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,0.4)",
      marginTop: 4
    }
  }, sub))));
}
function OfflineBadge() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pend, setPend] = useState(0);
  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    const cont = async () => {
      try {
        setPend(await fsdb.pendentesLocal());
      } catch (e) {}
    };
    window.addEventListener('online', up);
    window.addEventListener('offline', up);
    cont();
    const iv = setInterval(cont, 5000);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', up);
      clearInterval(iv);
    };
  }, []);
  if (online && pend === 0) return null;
  const msg = !online ? 'OFFLINE — salvando localmente. Sincroniza ao reconectar.' : (pend + ' registro(s) aguardando sincronização.');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: online ? "rgba(39,174,96,0.92)" : "rgba(192,57,43,0.92)",
      color: "#ffffff",
      textAlign: "center",
      padding: "8px 12px",
      fontFamily: "'Oswald',sans-serif",
      fontSize: 11,
      letterSpacing: 1
    }
  }, msg);
}
