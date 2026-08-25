export type PerfilAcesso = string;

export type StatusUsuario = "Ativo" | "Inativo";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  empresa: string;
  cargo: string;
  perfil: PerfilAcesso;
  status: StatusUsuario;
  modulosAcesso: string[];
  ultimoAcesso: string;
  senhaTemporaria: boolean;
  dataCriacao: string;
}

export interface ModuloSistema {
  id: string;
  nome: string;
  descricao: string;
}

export const MODULOS_SISTEMA: ModuloSistema[] = [
  { id: "repasse", nome: "Repasse", descricao: "Relatórios e conciliação de repasses de pedágio" },
  { id: "pedidos-pagos", nome: "Pedidos Pagos", descricao: "Consulta de transações quitadas e comprovantes" },
  { id: "gestao-usuarios", nome: "Gestão de Usuários", descricao: "Gerenciamento de contas, perfis e permissões" },
  { id: "configuracoes", nome: "Configurações", descricao: "Configurações gerais da conta da concessionária" },
  { id: "relatorios", nome: "Relatórios", descricao: "Relatórios gerenciais e exportação de dados" },
  { id: "atendimentos", nome: "Atendimentos", descricao: "Gestão de chamados e ouvidoria" },
  { id: "consultas", nome: "Consultas", descricao: "Consulta rápida de placas e passagens" },
  { id: "auditoria", nome: "Auditoria", descricao: "Logs de segurança e histórico de acessos" },
];

export interface PerfilModulo {
  id: string;
  nome: string;
  descricao: string;
  modulos: string[];
  isSistema?: boolean;
  dataCriacao?: string;
}

export const PERFIS_INICIAIS: PerfilModulo[] = [
  {
    id: "perf-1",
    nome: "Administrador",
    descricao: "Acesso total a todos os módulos e configurações da concessionária.",
    modulos: ["Repasse", "Pedidos Pagos", "Gestão de Usuários", "Configurações", "Relatórios", "Atendimentos", "Consultas", "Auditoria"],
    isSistema: true,
  },
  {
    id: "perf-2",
    nome: "Analista",
    descricao: "Acesso a relatórios de repasse, transações pagas e relatórios gerenciais.",
    modulos: ["Repasse", "Pedidos Pagos", "Relatórios"],
    isSistema: true,
  },
  {
    id: "perf-3",
    nome: "Ouvidoria",
    descricao: "Acesso a pesquisas de transações quitadas e atendimento ao cliente.",
    modulos: ["Pedidos Pagos", "Atendimentos"],
    isSistema: true,
  },
  {
    id: "perf-4",
    nome: "Visualizador",
    descricao: "Acesso somente leitura para consultas simples e relatórios básicos.",
    modulos: ["Consultas", "Relatórios"],
    isSistema: true,
  },
];

export function getModulosPorPerfil(perfil: string, listaPerfis: PerfilModulo[] = PERFIS_INICIAIS): string[] {
  const p = listaPerfis.find((item) => item.nome.toLowerCase() === perfil.toLowerCase());
  if (p) return p.modulos;

  switch (perfil) {
    case "Administrador":
      return ["Repasse", "Pedidos Pagos", "Gestão de Usuários", "Configurações"];
    case "Analista":
      return ["Repasse", "Pedidos Pagos", "Relatórios"];
    case "Ouvidoria":
      return ["Pedidos Pagos", "Atendimentos"];
    case "Visualizador":
      return ["Consultas", "Relatórios"];
    default:
      return ["Consultas"];
  }
}

export interface CriterioSenha {
  id: string;
  label: string;
  atendido: boolean;
}

export function validarCriteriosSenha(senha: string): CriterioSenha[] {
  return [
    {
      id: "minChar",
      label: "Pelo menos 8 caracteres",
      atendido: senha.length >= 8,
    },
    {
      id: "maiuscula",
      label: "Pelo menos 1 letra maiúscula",
      atendido: /[A-Z]/.test(senha),
    },
    {
      id: "minuscula",
      label: "Pelo menos 1 letra minúscula",
      atendido: /[a-z]/.test(senha),
    },
    {
      id: "numero",
      label: "Pelo menos 1 número",
      atendido: /[0-9]/.test(senha),
    },
    {
      id: "especial",
      label: "Pelo menos 1 caractere especial (!@#$%^&*)",
      atendido: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha),
    },
  ];
}
