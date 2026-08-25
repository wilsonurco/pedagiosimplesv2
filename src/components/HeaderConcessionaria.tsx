import { useState } from "react";
import LogoCinza from "../imports/LogoCinza";
import { LogOut, ChevronDown, User as UserIcon, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Usuario } from "../types/usuario";

interface HeaderConcessionariaProps {
  usuarioLogado: Partial<Usuario>;
  onAbrirMeuPerfil: () => void;
  onLogout: () => void;
}

export function HeaderConcessionaria({
  usuarioLogado,
  onAbrirMeuPerfil,
  onLogout,
}: HeaderConcessionariaProps) {
  const nome = usuarioLogado.nome || "Giuliana Santiago";
  const perfil = usuarioLogado.perfil || "Administrador";
  const empresa = usuarioLogado.empresa || "Concessionária Via Expressa S/A";
  const primeiraLetra = nome.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-[#DCDDE3] sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Logo */}
        <div className="w-44 h-10 flex items-center">
          <LogoCinza />
        </div>

        {/* Menu do Usuário no Cabeçalho */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-[#F7F5FB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B2E8C]/20 border border-transparent hover:border-[#DCDDE3] cursor-pointer">
              {/* Avatar com inicial */}
              <div className="w-9 h-9 rounded-full bg-[#5B2E8C] text-white flex items-center justify-center font-bold text-sm">
                {primeiraLetra}
              </div>

              {/* Nome e Perfil por Extenso */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold text-[#1A1B23] leading-tight flex items-center gap-1.5">
                  {nome}
                </span>
                <span className="text-xs text-[#8A8B95] font-medium leading-tight">
                  {perfil}
                </span>
              </div>

              {/* Ícone de Expansão */}
              <ChevronDown className="w-4 h-4 text-[#8A8B95] ml-0.5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60 bg-white border border-[#DCDDE3] p-1.5 rounded-xl">
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#1A1B23]">{nome}</span>
                <span className="text-[11px] text-[#8A8B95] truncate">{empresa}</span>
                <div className="mt-1">
                  <Badge className="bg-[#5B2E8C]/10 text-[#5B2E8C] border-[#5B2E8C]/20 text-[10px] py-0 px-2 font-semibold">
                    <Shield className="w-2.5 h-2.5 mr-1" />
                    {perfil}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-[#E5E6EC]" />

            <DropdownMenuItem
              onClick={onAbrirMeuPerfil}
              className="px-3 py-2 text-xs font-medium text-[#1A1B23] hover:bg-[#F7F5FB] hover:text-[#5B2E8C] cursor-pointer rounded-lg flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4 text-[#5B2E8C]" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-[#E5E6EC]" />

            <DropdownMenuItem
              onClick={onLogout}
              className="px-3 py-2 text-xs font-medium text-[#C8324A] hover:bg-red-50 hover:text-[#C8324A] cursor-pointer rounded-lg flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-[#C8324A]" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
