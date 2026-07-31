// ── ADMINISTRADOR ──
function GestorScreen({
  user,
  onBack
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    usuario: '',
    senha: '',
    role: 'tecnico'
  });
  const [erro, setErro] = useState('');
  const [confirmDel, setConfirmDel] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    senha: '',
    role: 'tecnico',
    ativo: true
  });
  const [salvandoEdit, setSalvandoEdit] = useState(false);
  const [erroEdit, setErroEdit] = useState('');
  useEffect(() => {
    const unsubscribe = fsdb.subscribeUsers(dados => {
      setUsers(dados);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const filtrados = useMemo(() => {
    if (!busca.trim()) return users;
    const termo = busca.toLowerCase();
    return users.filter(u => u.nome?.toLowerCase().includes(termo) || u.usuario?.toLowerCase().includes(termo) || (ROLE_LABELS[u.role] || u.role).toLowerCase().includes(termo));
  }, [users, busca]);
  async function handleAdd() {
    if (!form.nome || !form.usuario || !form.senha) {
      setErro('Preencha todos os campos.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const existe = await fsdb.userExists(form.usuario);
      if (existe) {
        setErro('Usuário já existe.');
        setSalvando(false);
        return;
      }
      const novo = await fsdb.addUser({
        ...form,
        usuario: form.usuario.toLowerCase()
      });
      setUsers(u => [...u, novo]);
      setForm({
        nome: '',
        usuario: '',
        senha: '',
        role: 'tecnico'
      });
      setShowForm(false);
    } catch (e) {
      setErro('Erro ao salvar. Tente novamente.');
    }
    setSalvando(false);
  }
  async function handleDelete(id) {
    await fsdb.deleteUser(id);
    setUsers(u => u.filter(x => x.id !== id));
    setConfirmDel(null);
  }
  function abrirEdicao(u) {
    setEditUser(u);
    setEditForm({
      nome: u.nome || '',
      senha: '',
      role: u.role || 'tecnico',
      ativo: u.ativo !== false
    });
    setErroEdit('');
  }
  async function handleEditSave() {
    if (!editForm.nome.trim()) {
      setErroEdit('O nome não pode ficar vazio.');
      return;
    }
    setSalvandoEdit(true);
    setErroEdit('');
    try {
      const updates = { nome: editForm.nome.trim(), role: editForm.role, ativo: editForm.ativo };
      if (editForm.senha.trim()) updates.senha = editForm.senha;
      await fsdb.updateUser(editUser.id, updates);
      setUsers(u => u.map(x => x.id === editUser.id ? { ...x, ...updates } : x));
      setEditUser(null);
    } catch (e) {
      setErroEdit('Erro ao salvar. Tente novamente.');
    }
    setSalvandoEdit(false);
  }
  async function handleToggleAtivo(u) {
    const novoAtivo = u.ativo === false ? true : false;
    await fsdb.updateUser(u.id, { ativo: novoAtivo });
    setUsers(users => users.map(x => x.id === u.id ? { ...x, ativo: novoAtivo } : x));
  }
  const opcoesPerfil = Object.entries(ROLE_LABELS).map(([value, label]) => /*#__PURE__*/React.createElement("option", { key: value, value: value }, label));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#000000",
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement(Header, {
    title: "USU\xC1RIOS",
    subtitle: "Gerenciar contas",
    onBack: onBack,
    right: /*#__PURE__*/React.createElement("button", {
      className: "folder-tile-fx",
      onClick: () => {
        setShowForm(s => !s);
        setErro('');
      },
      style: {
        "--glow": "#c0392b",
        background: "#c0392b",
        border: "none",
        color: "#000000",
        fontFamily: "'Oswald',sans-serif",
        fontWeight: 700,
        fontSize: 12,
        padding: "7px 14px",
        borderRadius: 8,
        cursor: "pointer",
        letterSpacing: 1,
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(PlusIcon, null), "NOVO")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16
    }
  }, showForm && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(192,57,43,0.08)",
      border: "1px solid rgba(245,166,35,0.2)",
      borderRadius: 12,
      padding: "18px 16px",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Nova Conta"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nome completo"
  }, /*#__PURE__*/React.createElement("input", {
    value: form.nome,
    onChange: e => setForm(f => ({
      ...f,
      nome: e.target.value
    })),
    placeholder: "Nome do usu\xE1rio"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Usu\xE1rio (login)"
  }, /*#__PURE__*/React.createElement("input", {
    value: form.usuario,
    onChange: e => setForm(f => ({
      ...f,
      usuario: e.target.value
    })),
    placeholder: "Ex: joao.silva"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Senha"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: form.senha,
    onChange: e => setForm(f => ({
      ...f,
      senha: e.target.value
    })),
    placeholder: "Senha de acesso"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Perfil"
  }, /*#__PURE__*/React.createElement("select", {
    value: form.role,
    onChange: e => setForm(f => ({
      ...f,
      role: e.target.value
    }))
  }, opcoesPerfil))), erro && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(192,57,43,0.15)",
      border: "1px solid rgba(192,57,43,0.3)",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 13,
      color: "#e74c3c",
      marginBottom: 12
    }
  }, erro), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowForm(false);
      setErro('');
    },
    style: {
      flex: 1,
      background: "transparent",
      border: "1px solid rgba(232,220,200,0.15)",
      color: "rgba(255,255,255,0.5)",
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: "11px",
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
    className: "folder-tile-fx",
    onClick: handleAdd,
    disabled: salvando,
    style: {
      "--glow": "#c0392b",
      flex: 2,
      background: salvando ? "rgba(100,100,100,0.5)" : "#c0392b",
      border: "none",
      color: "#000000",
      fontFamily: "'Oswald',sans-serif",
      fontWeight: 700,
      fontSize: 14,
      padding: "11px",
      borderRadius: 8,
      cursor: "pointer",
      letterSpacing: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6
    }
  }, !salvando && /*#__PURE__*/React.createElement(PlusCircleIcon, {
    size: 14
  }), salvando ? "SALVANDO..." : "CADASTRAR"))), /*#__PURE__*/React.createElement("input", {
    value: busca,
    onChange: e => setBusca(e.target.value),
    placeholder: "Buscar por nome, usu\xE1rio ou perfil...",
    style: {
      width: "100%",
      marginBottom: 10,
      background: "#111111",
      border: "1px solid rgba(245,166,35,0.2)",
      borderRadius: 10,
      padding: "10px 14px",
      color: "#e8dcc8",
      fontSize: 13,
      outline: "none"
    }
  }), loading ? /*#__PURE__*/React.createElement(Spinner, null) : filtrados.length === 0 && !showForm ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "50px 20px",
      color: "rgba(255,255,255,0.3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(UsersIcon, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 2,
      fontSize: 13
    }
  }, busca ? "NENHUM USU\xC1RIO ENCONTRADO" : "NENHUM USU\xC1RIO"), busca ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 8
    }
  }, "Clique em \"+ NOVO\" para adicionar")) : filtrados.map(u => /*#__PURE__*/React.createElement("div", {
    key: u.id,
    style: {
      background: "#111111",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      background: u.ativo === false ? "rgba(100,100,100,0.1)" : "rgba(192,57,43,0.15)",
      border: "1px solid rgba(245,166,35,0.2)",
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: u.ativo === false ? "rgba(255,255,255,0.2)" : "#f5c518",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(UserIcon, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 14,
      color: u.ativo === false ? "rgba(255,255,255,0.3)" : "#ffffff",
      letterSpacing: 1
    }
  }, u.nome), u.ativo === false && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      background: "rgba(231,76,60,0.2)",
      color: "#e74c3c",
      border: "1px solid rgba(231,76,60,0.3)",
      borderRadius: 10,
      padding: "1px 7px",
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1
    }
  }, "INATIVO")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: u.ativo === false ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)",
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1
    }
  }, "@", u.usuario), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: u.ativo === false ? "rgba(255,255,255,0.15)" : "#f5c518",
      fontFamily: "'Oswald',sans-serif",
      letterSpacing: 1,
      marginTop: 3
    }
  }, ROLE_LABELS[u.role] || u.role)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, u.id !== user.id && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => abrirEdicao(u),
    style: {
      background: "rgba(41,128,185,0.15)",
      border: "1px solid rgba(245,166,35,0.2)",
      color: "#f5c518",
      borderRadius: 8,
      padding: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(EditIcon, {
    size: 13
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleToggleAtivo(u),
    title: u.ativo === false ? "Ativar" : "Desativar",
    style: {
      background: u.ativo === false ? "rgba(39,174,96,0.15)" : "rgba(231,76,60,0.15)",
      border: `1px solid ${u.ativo === false ? "rgba(39,174,96,0.3)" : "rgba(231,76,60,0.3)"}`,
      color: u.ativo === false ? "#27ae60" : "#e74c3c",
      borderRadius: 8,
      padding: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center"
    }
  }, u.ativo === false ? /*#__PURE__*/React.createElement(CheckIcon, {
    size: 14
  }) : /*#__PURE__*/React.createElement(XIcon, {
    size: 14
  }))), u.id !== user.id && /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmDel(u.id),
    style: {
      background: "rgba(192,57,43,0.15)",
      border: "1px solid rgba(192,57,43,0.2)",
      color: "#e74c3c",
      borderRadius: 8,
      padding: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(TrashIcon, null))))), confirmDel && /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement(AlertIcon, null), "REMOVER USU\xC1RIO?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,0.5)",
      marginBottom: 20
    }
  }, "O usu\xE1rio perder\xE1 acesso ao sistema."), /*#__PURE__*/React.createElement("div", {
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
      background: "rgba(192,57,43,0.8)",
      border: "none",
      color: "white",
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: "10px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(TrashIcon, {
    size: 14
  }), "REMOVER")))), editUser && /*#__PURE__*/React.createElement("div", {
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
      maxWidth: 360,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 16,
      color: "#ffffff",
      letterSpacing: 1,
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(EditIcon, {
    size: 16
  }), "EDITAR USU\xC1RIO"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nome completo"
  }, /*#__PURE__*/React.createElement("input", {
    value: editForm.nome,
    onChange: e => setEditForm(f => ({ ...f, nome: e.target.value })),
    placeholder: "Nome do usu\xE1rio"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Nova senha (deixe em branco para manter)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: editForm.senha,
    onChange: e => setEditForm(f => ({ ...f, senha: e.target.value })),
    placeholder: "Nova senha"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Perfil"
  }, /*#__PURE__*/React.createElement("select", {
    value: editForm.role,
    onChange: e => setEditForm(f => ({ ...f, role: e.target.value }))
  }, opcoesPerfil)), /*#__PURE__*/React.createElement(Field, {
    label: "Status"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "4px 0"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditForm(f => ({ ...f, ativo: !f.ativo })),
    style: {
      width: 48,
      height: 26,
      background: editForm.ativo ? "rgba(39,174,96,0.4)" : "rgba(231,76,60,0.3)",
      border: `2px solid ${editForm.ativo ? "#27ae60" : "#e74c3c"}`,
      borderRadius: 13,
      cursor: "pointer",
      position: "relative",
      transition: "all 0.2s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 18,
      height: 18,
      background: editForm.ativo ? "#27ae60" : "#e74c3c",
      borderRadius: "50%",
      position: "absolute",
      top: 2,
      left: editForm.ativo ? 26 : 2,
      transition: "left 0.2s"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Oswald',sans-serif",
      fontSize: 12,
      color: editForm.ativo ? "#27ae60" : "#e74c3c",
      letterSpacing: 1
    }
  }, editForm.ativo ? "ATIVO" : "INATIVO")))), erroEdit && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(192,57,43,0.15)",
      border: "1px solid rgba(192,57,43,0.3)",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 13,
      color: "#e74c3c",
      marginBottom: 12
    }
  }, erroEdit), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditUser(null),
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
    onClick: handleEditSave,
    disabled: salvandoEdit,
    style: {
      flex: 2,
      background: salvandoEdit ? "rgba(100,100,100,0.5)" : "rgba(41,128,185,0.8)",
      border: "none",
      color: "white",
      fontFamily: "'Oswald',sans-serif",
      fontSize: 13,
      padding: "10px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(SaveIcon, {
    size: 13
  }), salvandoEdit ? "SALVANDO..." : "SALVAR"))))));
}
