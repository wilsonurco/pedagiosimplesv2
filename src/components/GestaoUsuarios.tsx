import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
  Pencil,
  ShieldAlert,
  Settings,
  Plus,
} from "lucide-react";
import { Usuario, PerfilAcesso, StatusUsuario, getModulosPorPerfil, PerfilModulo, PERFIS_INICIAIS } from "../types/usuario";
import { ModalUsuarioForm } from "./ModalUsuarioForm";
import { ModalExcluirUsuario } from "./ModalExcluirUsuario";
import { ModalGestaoPerfis } from "./ModalGestaoPerfis";
import { toast } from "sonner";

interface GestaoUsuariosProps {
  usuarioLogadoPerfil?: PerfilAcesso;
  usuarioLogadoId?: string;
}

const USUARIOS_INICIAIS: Usuario[] = [
  {
    id: "usr-1",
    nome: "João Silva Santos",
    email: "joao.silva@movemais.com.br",
    empresa: "Move Mais",
    cargo: "Coordenador de Operações",
    perfil: "Administrador",
    status: "Ativo",
    modulosAcesso: ["Funil", "Análise", "Financeiro", "Contratos"],
    ultimoAcesso: "28/04/2026",
    senhaTemporaria: false,
    dataCriacao: "28/04/2026",
  },
  {
    id: "usr-2",
    nome: "Maria Santos Ferreira",
    email: "maria.santos@volkswagen.com",
    empresa: "Volkswagen",
    cargo: "Gestora de Parceiros",
    perfil: "Gestor Operacional",
    status: "Ativo",
    modulosAcesso: ["Funil", "Análise", "Financeiro", "Contratos"],
    ultimoAcesso: "27/04/2026",
    senhaTemporaria: false,
    dataCriacao: "27/04/2026",
  },
  {
    id: "usr-3",
    nome: "Carlos Mendes Oliveira",
    email: "carlos.mendes@parceiro.com.br",
    empresa: "Parceiro",
    cargo: "Analista Comercial",
    perfil: "Analista",
    status: "Ativo",
    modulosAcesso: ["Funil", "Análise", "Financeiro", "Contratos"],
    ultimoAcesso: "25/04/2026",
    senhaTemporaria: false,
    dataCriacao: "25/04/2026",
  },
  {
    id: "usr-4",
    nome: "Giuliana Santiago",
    email: "giuliana.santiago@pedagiosimples.com.br",
    empresa: "Concessionária Via Expressa S/A",
    cargo: "Gerente de TI & Operações",
    perfil: "Administrador",
    status: "Ativo",
    modulosAcesso: ["Repasse", "Pedidos Pagos", "Gestão de Usuários", "Configurações"],
    ultimoAcesso: "25/08/2026",
    senhaTemporaria: false,
    dataCriacao: "25/08/2026",
  },
  {
    id: "usr-5",
    nome: "Roberto Alves Fonseca",
    email: "roberto.alves@viaexpressa.com.br",
    empresa: "Concessionária Via Expressa S/A",
    cargo: "Auditor Externo",
    perfil: "Visualizador",
    status: "Inativo",
    modulosAcesso: ["Consultas", "Relatórios"],
    ultimoAcesso: "15/08/2026",
    senhaTemporaria: false,
    dataCriacao: "15/08/2026",
  },
];

function getIniciais(nome: string): string {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return nome.slice(0, 2).toUpperCase();
}

function getAvatarBg(nome: string): string {
  const bgList = [
    "bg-[#0A2540]", // Dark navy
    "bg-[#1E88E5]", // Blue
    "bg-[#00A859]", // Green
    "bg-[#6B3BA7]", // Purple
    "bg-[#D97706]", // Amber
  ];
  let code = 0;
  for (let i = 0; i < nome.length; i++) code += nome.charCodeAt(i);
  return bgList[code % bgList.length];
}

function getPerfilBadge(perfil: string) {
  switch (perfil.toLowerCase()) {
    case "administrador":
      return (
        <span className="bg-[#2B1B47] text-white px-3 py-1 rounded-full text-xs font-semibold inline-block">
          Administrador
        </span>
      );
    case "gestor operacional":
      return (
        <span className="bg-[#6B3BA7] text-white px-3 py-1 rounded-full text-xs font-semibold inline-block">
          Gestor Operacional
        </span>
      );
    case "analista":
      return (
        <span className="bg-[#00A859] text-white px-3 py-1 rounded-full text-xs font-semibold inline-block">
          Analista
        </span>
      );
    case "ouvidoria":
      return (
        <span className="bg-[#D97706] text-white px-3 py-1 rounded-full text-xs font-semibold inline-block">
          Ouvidoria
        </span>
      );
    case "visualizador":
      return (
        <span className="bg-[#64748B] text-white px-3 py-1 rounded-full text-xs font-semibold inline-block">
          Visualizador
        </span>
      );
    default:
      return (
        <span className="bg-[#6B3BA7] text-white px-3 py-1 rounded-full text-xs font-semibold inline-block">
          {perfil}
        </span>
      );
  }
}

export function GestaoUsuarios({
  usuarioLogadoPerfil = "Administrador",
  usuarioLogadoId = "usr-master-1",
}: GestaoUsuariosProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_INICIAIS);
  const [perfis, setPerfis] = useState<PerfilModulo[]>(PERFIS_INICIAIS);

  // Modais
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalPerfisOpen, setModalPerfisOpen] = useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<Usuario | null>(null);

  const [modalExcluirOpen, setModalExcluirOpen] = useState(false);
  const [usuarioEmExclusao, setUsuarioEmExclusao] = useState<Usuario | null>(null);

  const isAdministrador = usuarioLogadoPerfil === "Administrador";

  // Métricas
  const totalUsuarios = usuarios.length;
  const totalAtivos = usuarios.filter((u) => u.status === "Ativo").length;
  const totalAdmins = usuarios.filter((u) => u.perfil === "Administrador").length;

  // Handler de Salvar (Criar ou Editar)
  const handleSalvarUsuario = (dados: Partial<Usuario>) => {
    if (dados.id) {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === dados.id ? ({ ...u, ...dados } as Usuario) : u))
      );
      toast.success("Usuário atualizado com sucesso.");
    } else {
      const novoUsr: Usuario = {
        id: `usr-${Date.now()}`,
        nome: dados.nome || "",
        email: dados.email || "",
        empresa: dados.empresa || "Concessionária Via Expressa S/A",
        cargo: dados.cargo || "Colaborador",
        perfil: dados.perfil || "Analista",
        status: dados.status || "Ativo",
        modulosAcesso: dados.modulosAcesso || getModulosPorPerfil(dados.perfil || "Analista", perfis),
        ultimoAcesso: new Date().toLocaleDateString("pt-BR"),
        senhaTemporaria: true,
        dataCriacao: new Date().toLocaleDateString("pt-BR"),
      };
      setUsuarios((prev) => [novoUsr, ...prev]);
      toast.success("Usuário cadastrado com sucesso. E-mail de onboarding enviado.");
    }
  };

  // Handler de Alternar Status (Ativo / Inativo)
  const handleToggleStatus = (usuario: Usuario) => {
    const novoStatus: StatusUsuario = usuario.status === "Ativo" ? "Inativo" : "Ativo";
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuario.id ? { ...u, status: novoStatus } : u))
    );
    toast.success(
      `Status do usuário ${usuario.nome} alterado para ${novoStatus.toUpperCase()}.`
    );
  };

  // Handler de Exclusão Lógica
  const handleConfirmarExclusao = (usuarioId: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== usuarioId));
    toast.success("Usuário excluído com sucesso.");
  };

  return (
    <div className="space-y-6">
      {/* Banner de aviso se não for administrador */}
      {!isAdministrador && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <strong>Acesso Restrito:</strong> Seu perfil atual (<strong>{usuarioLogadoPerfil}</strong>) possui permissão apenas de visualização. Operações de criação, edição e gestão de perfis exigem perfil de <strong>Administrador</strong>.
          </div>
        </div>
      )}

      {/* Título e Ação principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1B23]">
            Gestão de Usuários
          </h2>
          <p className="text-xs text-[#8A8B95] mt-1 font-medium">
            {totalUsuarios} usuários cadastrados · {totalAtivos} ativos
          </p>
        </div>

        {isAdministrador && (
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setModalPerfisOpen(true)}
              variant="outline"
              className="border-[#DCDDE3] text-[#5B2E8C] hover:bg-[#F7F5FB] hover:text-[#5B2E8C] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#5B2E8C]" />
              Gerenciar Perfis
            </Button>

            <Button
              onClick={() => {
                setUsuarioEmEdicao(null);
                setModalFormOpen(true);
              }}
              className="bg-[#6B3BA7] hover:bg-[#5B2E8C] text-white rounded-lg px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </div>
        )}
      </div>

      {/* Tabela de Usuários Estilizada conforme referência */}
      <div className="bg-white rounded-xl border border-[#DCDDE3] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F9FAFC] border-b border-[#DCDDE3]">
              <TableRow className="border-b border-[#DCDDE3] hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-[#8A8B95] tracking-wider uppercase py-3.5 px-4">
                  USUÁRIO
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#8A8B95] tracking-wider uppercase py-3.5 px-4">
                  EMPRESA
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#8A8B95] tracking-wider uppercase py-3.5 px-4">
                  PERFIL
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#8A8B95] tracking-wider uppercase py-3.5 px-4">
                  MÓDULOS
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#8A8B95] tracking-wider uppercase py-3.5 px-4">
                  STATUS
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#8A8B95] tracking-wider uppercase py-3.5 px-4">
                  ÚLTIMO ACESSO
                </TableHead>
                {isAdministrador && (
                  <TableHead className="text-[11px] font-bold text-[#8A8B95] tracking-wider uppercase py-3.5 px-4 text-right">
                    AÇÕES
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdministrador ? 7 : 6} className="text-center py-8 text-xs text-[#8A8B95]">
                    Nenhum usuário cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => (
                  <TableRow key={u.id} className="border-b border-[#F0F1F5] hover:bg-[#F9FAFC] transition-colors">
                    {/* Usuário (Avatar + Nome + E-mail + Cargo) */}
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${getAvatarBg(
                            u.nome
                          )} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                        >
                          {getIniciais(u.nome)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#1A1B23]">
                            {u.nome}
                          </span>
                          <span className="text-xs text-[#8A8B95]">{u.email}</span>
                          <span className="text-[11px] text-[#A0A1AB] font-medium">{u.cargo}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Empresa */}
                    <TableCell className="text-xs font-semibold text-[#1A1B23] py-4 px-4">
                      {u.empresa}
                    </TableCell>

                    {/* Perfil */}
                    <TableCell className="py-4 px-4">
                      {getPerfilBadge(u.perfil)}
                    </TableCell>

                    {/* Módulos com Acesso */}
                    <TableCell className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {u.modulosAcesso.map((mod) => (
                          <span
                            key={mod}
                            className="bg-[#EBF3FF] text-[#2F80ED] border border-[#D0E2FF]/50 text-xs px-2.5 py-0.5 rounded-md font-medium"
                          >
                            {mod}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    {/* Status com Switch Toggle */}
                    <TableCell className="py-4 px-4">
                      <button
                        disabled={!isAdministrador}
                        onClick={() => handleToggleStatus(u)}
                        title={isAdministrador ? "Clique para alterar o status" : undefined}
                        className="inline-flex items-center gap-2 cursor-pointer disabled:cursor-default"
                      >
                        <div
                          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 flex items-center ${
                            u.status === "Ativo" ? "bg-[#00A859]" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              u.status === "Ativo" ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            u.status === "Ativo" ? "text-[#00A859]" : "text-gray-500"
                          }`}
                        >
                          {u.status}
                        </span>
                      </button>
                    </TableCell>

                    {/* Último Acesso */}
                    <TableCell className="text-xs font-medium text-[#4A4B57] py-4 px-4">
                      {u.ultimoAcesso}
                    </TableCell>

                    {/* Ações */}
                    {isAdministrador && (
                      <TableCell className="text-right py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUsuarioEmEdicao(u);
                            setModalFormOpen(true);
                          }}
                          title="Editar Usuário"
                          className="h-8 w-8 p-0 text-[#8A8B95] hover:text-[#6B3BA7] hover:bg-[#F7F5FB] rounded-lg cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modais de Formulário, Perfis e Exclusão */}
      <ModalUsuarioForm
        open={modalFormOpen}
        onOpenChange={setModalFormOpen}
        usuarioEdicao={usuarioEmEdicao}
        onSalvar={handleSalvarUsuario}
        perfisDisponiveis={perfis}
      />

      <ModalGestaoPerfis
        open={modalPerfisOpen}
        onOpenChange={setModalPerfisOpen}
        perfis={perfis}
        onAtualizarPerfis={setPerfis}
      />

      <ModalExcluirUsuario
        open={modalExcluirOpen}
        onOpenChange={setModalExcluirOpen}
        usuarioExclusao={usuarioEmExclusao}
        usuarioLogadoId={usuarioLogadoId}
        totalAdministradores={totalAdmins}
        onConfirmarExclusao={handleConfirmarExclusao}
      />
    </div>
  );
}
