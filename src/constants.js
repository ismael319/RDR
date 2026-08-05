const LOGO_SRC = window.__LOGO_SRC__;
const {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo
} = React;
const CATEGORIAS = ["Ferramentas", "Comportamental", "Documentos", "EPI", "Equipamentos", "5S", "Sinalização", "Reconhecimento", "Condição Insegura"];
const ROLES_LIMITADAS = ['tecnico', 'engcivil', 'engplan', 'encarregado', 'adm'];
const ROLES_SOMENTE_PROPRIOS = ['tecnico', 'engcivil'];
const ROLE_LABELS = {
  gestor: 'ADMINISTRADOR',
  gestorobra: 'GERENTE DE CONTRATO',
  tecnico: 'TST',
  engcivil: 'ENGENHEIRO CIVIL',
  engplan: 'ENG. PLANEJAMENTO',
  encarregado: 'ENCARREGADO',
  adm: 'ADM'
};
const SESSION_KEY = 'rdr_session';
const session = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  },
  set: u => localStorage.setItem(SESSION_KEY, JSON.stringify(u)),
  clear: () => localStorage.removeItem(SESSION_KEY)
};
