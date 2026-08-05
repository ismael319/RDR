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
    const montar = (idFiltro) => {
      let q = sb.from('rdr_records').select('*');
      if (idFiltro) q = q.eq('autor_id', idFiltro);
      return q.order('saved_at', { ascending: false });
    };
    const entregar = async (dados) => {
      if (!dados) return;
      const recs = dados.map(mapRecord);
      cacheRecords(recs);
      callback(recs);
    };
    const buscar = async () => {
      try {
        const { data } = await montar(autorId);
        await entregar(data);
      } catch (e) {
        callback(await getCachedRecords());
      }
    };
    buscar();
    const channel = sb
      .channel('rdr_records_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rdr_records' }, async () => {
        try {
          const { data } = await montar(autorId);
          await entregar(data);
        } catch (e) {}
      })
      .subscribe();
    window.addEventListener('online', buscar);
    return () => {
      sb.removeChannel(channel);
      window.removeEventListener('online', buscar);
    };
  },
  // Records
  async _salvar(rec) {
    if (rec.id && rec._exists) {
      const { _exists, _pendente, _localTs, ...r } = rec;
      const { error } = await sb.from('rdr_records').update({
        data_ocorrido: r.dataOcorrido,
        hora: r.hora,
        autor_id: r.autorId,
        autor_nome: r.autorNome,
        local: r.local,
        categorias: r.categorias,
        concluido: r.concluido,
        nome_colaborador: r.nomeColaborador,
        responsavel_setor: r.responsavelSetor,
        responsavel_registro: r.responsavelRegistro,
        descricao: r.descricao,
        sugestao_correcao: r.sugestaoCorrecao,
        prazo: r.prazo,
        fotos: r.fotos,
        saved_at: new Date().toISOString()
      }).eq('id', r.id);
      if (error) throw error;
      return rec;
    } else {
      const { id, _exists, _pendente, _localTs, ...data } = rec;
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
  async saveRecord(rec) {
    try {
      return await this._salvar(rec);
    } catch (e) {
      const pendente = { ...rec, _pendente: true, _localTs: Date.now() };
      if (!pendente.id) pendente.id = 'local_' + pendente._localTs + '_' + Math.floor(Math.random() * 1000000);
      await enqueueOp({ op: 'save', rec: pendente });
      await cacheRecords([pendente]);
      return pendente;
    }
  },
  async deleteRecord(id) {
    try {
      await sb.from('rdr_records').delete().eq('id', id);
      await removerCached(id);
    } catch (e) {
      const ops = await getPendingOps();
      const pendente = ops.find(o => o.op === 'save' && o.rec && o.rec.id === id && !o.rec._exists);
      if (pendente) {
        await removeOp(pendente.ts);
        await removerCached(id);
        return;
      }
      await enqueueOp({ op: 'delete', rec: { id } });
      await removerCached(id);
    }
  },
  async pendentesLocal() {
    try {
      const ops = await getPendingOps();
      return ops.length;
    } catch (e) { return 0; }
  },
  async sincronizar() {
    let ops;
    try {
      ops = await getPendingOps();
    } catch (e) { return; }
    ops.sort((a, b) => (a.ts || 0) - (b.ts || 0));
    for (const op of ops) {
      try {
        if (op.op === 'delete') {
          await sb.from('rdr_records').delete().eq('id', op.rec && op.rec.id);
          await removerCached(op.rec && op.rec.id);
        } else if (op.rec) {
          const salvo = await this._salvar(op.rec);
          const final = { ...salvo };
          delete final._pendente;
          delete final._localTs;
          delete final._exists;
          if (final.id && final.id !== op.rec.id) await removerCached(op.rec.id);
          await cacheRecords([final]);
        }
        await removeOp(op.ts);
      } catch (e) {
        break;
      }
    }
  }
};
