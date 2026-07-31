// ── Normalização de dados (snake_case do banco -> camelCase do app) ──
const mapRecord = r => ({
  ...r,
  dataOcorrido: r.data_ocorrido,
  autorId: r.autor_id,
  autorNome: r.autor_nome,
  nomeColaborador: r.nome_colaborador,
  responsavelSetor: r.responsavel_setor,
  responsavelRegistro: r.responsavel_registro,
  sugestaoCorrecao: r.sugestao_correcao,
  savedAt: r.saved_at
});
const mapAtividade = a => ({ ...a, recomendacoesGerais: a.recomendacoes_gerais });
const mapMontagem = m => ({
  ...m,
  responsavelSesmt: m.responsavel_sesmt,
  dataInicio: m.data_inicio,
  dataTermino: m.data_termino,
  recomendacoesGerais: m.recomendacoes_gerais,
  autorId: m.autor_id,
  autorNome: m.autor_nome,
  criadaEm: m.criada_em
});
const mapLog = l => ({ ...l, ...(l.dados || {}), atividadeId: l.atividade_id != null && l.atividade_id !== '' ? Number(l.atividade_id) : null, criadaEm: l.criada_em });
