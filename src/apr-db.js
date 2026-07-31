// ── APR Supabase helpers ──
const aprDb = {
  async getAllAtividades() {
    const { data, error } = await sb.from('apr_atividades').select('*').order('ordem');
    if (error) throw error;
    return (data || []).map(mapAtividade);
  },
  subscribeAtividades(callback) {
    sb.from('apr_atividades').select('*').order('ordem').then(({ data }) => {
      if (data) callback((data || []).map(mapAtividade));
    });
    const channel = sb
      .channel('apr_atividades_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'apr_atividades' }, async () => {
        const { data } = await sb.from('apr_atividades').select('*').order('ordem');
        if (data) callback((data || []).map(mapAtividade));
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  },
  async saveAtividade(atividade) {
    const { id, ...data } = atividade;
    const payload = {
      nome: data.nome || '',
      area: data.area || '',
      assunto: data.assunto || '',
      equipamentos: data.equipamentos || '',
      epis: data.epis || '',
      recomendacoes_gerais: data.recomendacoesGerais || '',
      fases: data.fases || [],
      ordem: data.ordem || Date.now()
    };
    if (id) {
      const { error } = await sb.from('apr_atividades').upsert({ id, ...payload });
      if (error) throw error;
      return atividade;
    }
    const { data: inserted, error } = await sb.from('apr_atividades').insert(payload).select().single();
    if (error) throw error;
    return { id: inserted.id, ...data };
  },
  async deleteAtividade(id) {
    await sb.from('apr_atividades').delete().eq('id', id);
  },
  async clearAll() {
    await sb.from('apr_atividades').delete().neq('id', '');
  },
  async importAtividades(atividades) {
    const { data: existing } = await sb.from('apr_atividades').select('nome');
    const nomesExistentes = new Set((existing || []).map(d => d.nome?.toLowerCase().trim()));
    let count = 0;
    let ordem = (existing || []).length;
    for (const a of atividades) {
      const key = (a.nome || '').toLowerCase().trim();
      if (nomesExistentes.has(key)) continue;
      nomesExistentes.add(key);
      ordem++;
      await sb.from('apr_atividades').insert({
        nome: a.nome || '',
        area: a.area || '',
        assunto: a.assunto || '',
        equipamentos: a.equipamentos || '',
        epis: a.epis || '',
        recomendacoes_gerais: a.recomendacoesGerais || '',
        fases: (a.fases || []).map(f => ({
          fase: f.fase || '',
          riscos: f.riscos || [],
          consequencias: f.consequencias || [],
          medidasIndividuais: f.medidasIndividuais || [],
          medidasColetivas: f.medidasColetivas || []
        })),
        ordem: ordem
      });
      count++;
    }
    return count;
  },
  // Montagens
  async getMontagens() {
    const { data, error } = await sb.from('apr_montagens').select('*').order('criada_em', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  subscribeMontagens(callback) {
    sb.from('apr_montagens').select('*').order('criada_em', { ascending: false }).then(({ data }) => {
      if (data) callback((data || []).map(mapMontagem));
    });
    const channel = sb
      .channel('apr_montagens_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'apr_montagens' }, async () => {
        const { data } = await sb.from('apr_montagens').select('*').order('criada_em', { ascending: false });
        if (data) callback((data || []).map(mapMontagem));
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  },
  async saveMontagem(m) {
    const { id, ...data } = m;
    const payload = {
      nome: data.nome || '',
      numero: data.numero || '',
      area: data.area || '',
      responsavel_sesmt: data.responsavelSesmt || '',
      funcao: data.funcao || '',
      assunto: data.assunto || '',
      local: data.local || '',
      data_inicio: data.dataInicio || '',
      data_termino: data.dataTermino || '',
      equipamentos: data.equipamentos || '',
      epis: data.epis || '',
      recomendacoes_gerais: data.recomendacoesGerais || '',
      fases: data.fases || [],
      autor_id: data.autorId || '',
      autor_nome: data.autorNome || ''
    };
    if (id) {
      const { error } = await sb.from('apr_montagens').upsert({ id, ...payload });
      if (error) throw error;
      return m;
    }
    const { data: inserted, error } = await sb.from('apr_montagens').insert({ ...payload, criada_em: new Date().toISOString() }).select().single();
    if (error) throw error;
    return { id: inserted.id, ...data };
  },
  async deleteMontagem(id) {
    await sb.from('apr_montagens').delete().eq('id', id);
  },
  // Log de alterações
  async logEdicao(entrada) {
    await sb.from('apr_log').insert({
      tipo: entrada.tipo || '',
      atividade_id: entrada.atividadeId || '',
      dados: entrada,
      revertido: false,
      criada_em: new Date().toISOString()
    });
  },
  subscribeLog(callback) {
    sb.from('apr_log').select('*').order('criada_em', { ascending: false }).limit(100).then(({ data }) => {
      if (data) callback((data || []).map(mapLog));
    });
    const channel = sb
      .channel('apr_log_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'apr_log' }, async () => {
        const { data } = await sb.from('apr_log').select('*').order('criada_em', { ascending: false }).limit(100);
        if (data) callback((data || []).map(mapLog));
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  },
  async marcarLogRevertido(logId) {
    await sb.from('apr_log').update({ revertido: true }).eq('id', logId);
  },
  async deleteLog(id) {
    await sb.from('apr_log').delete().eq('id', id);
  }
};
// ── END APR Supabase helpers ──

// Seed gestor padrão
(async () => {
  try {
    const { data: s } = await sb.from('rdr_users').select('id').eq('role', 'gestor').limit(1);
    if (!s || s.length === 0) {
      await sb.from('rdr_users').insert({
        nome: 'Gestor',
        usuario: 'gestor',
        senha: '1234',
        role: 'gestor',
        ativo: true
      });
    }
  } catch (e) {}
})();
