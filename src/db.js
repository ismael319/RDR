const fsdb = {
  // Users
  async updateUser(id, updates) {
    const { error } = await sb.from('rdr_users').update(updates).eq('id', id);
    if (error) throw error;
  },
  async addUser(u) {
    const { data, error } = await sb.from('rdr_users').insert({
      nome: u.nome,
      usuario: u.usuario.toLowerCase(),
      senha: u.senha,
      role: u.role,
      ativo: true
    }).select().single();
    if (error) throw error;
    return { id: data.id, ...u };
  },
  async deleteUser(id) {
    await sb.from('rdr_users').delete().eq('id', id);
  },
  async findUser(usuario, senha) {
    const { data, error } = await sb.from('rdr_users').select('*').eq('usuario', usuario.toLowerCase()).eq('senha', senha).maybeSingle();
    if (error || !data || data.ativo === false) return null;
    return data;
  },
  async userExists(usuario) {
    const { data } = await sb.from('rdr_users').select('id').eq('usuario', usuario.toLowerCase()).maybeSingle();
    return !!data;
  },
  // Listeners tempo real
  subscribeUsers(callback) {
    let query = sb.from('rdr_users').select('*');
    query.then(({ data }) => {
      if (data) callback(data);
    });
    const channel = sb
      .channel('rdr_users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rdr_users' }, async () => {
        const { data } = await sb.from('rdr_users').select('*');
        if (data) callback(data);
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  },
  subscribeRecords(callback, autorId = null) {
    let query = sb.from('rdr_records').select('*');
    if (autorId) query = query.eq('autor_id', autorId);
    query.order('saved_at', { ascending: false }).then(({ data }) => {
      if (data) callback((data || []).map(mapRecord));
    });
    const channel = sb
      .channel('rdr_records_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rdr_records' }, async () => {
        let q = sb.from('rdr_records').select('*');
        if (autorId) q = q.eq('autor_id', autorId);
        const { data } = await q.order('saved_at', { ascending: false });
        if (data) callback((data || []).map(mapRecord));
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  },
  // Records
  async saveRecord(rec) {
    if (rec.id && rec._exists) {
      const { _exists, ...payload } = rec;
      const { error } = await sb.from('rdr_records').update({
        data_ocorrido: rec.dataOcorrido,
        hora: rec.hora,
        autor_id: rec.autorId,
        autor_nome: rec.autorNome,
        local: rec.local,
        categorias: rec.categorias,
        concluido: rec.concluido,
        nome_colaborador: rec.nomeColaborador,
        responsavel_setor: rec.responsavelSetor,
        responsavel_registro: rec.responsavelRegistro,
        descricao: rec.descricao,
        sugestao_correcao: rec.sugestaoCorrecao,
        prazo: rec.prazo,
        fotos: rec.fotos,
        saved_at: new Date().toISOString()
      }).eq('id', rec.id);
      if (error) throw error;
      return rec;
    } else {
      const { id, _exists, ...data } = rec;
      const payload = {
        data_ocorrido: data.dataOcorrido,
        hora: data.hora,
        autor_id: data.autorId,
        autor_nome: data.autorNome,
        local: data.local,
        categorias: data.categorias,
        concluido: data.concluido,
        nome_colaborador: data.nomeColaborador,
        responsavel_setor: data.responsavelSetor,
        responsavel_registro: data.responsavelRegistro,
        descricao: data.descricao,
        sugestao_correcao: data.sugestaoCorrecao,
        prazo: data.prazo,
        fotos: data.fotos,
        saved_at: new Date().toISOString()
      };
      const { data: inserted, error } = await sb.from('rdr_records').insert(payload).select().single();
      if (error) throw error;
      return { id: inserted.id, ...data };
    }
  },
  async deleteRecord(id) {
    await sb.from('rdr_records').delete().eq('id', id);
  }
};
