/**
 * PEDÁGIO SIMPLES — Icon Library
 *
 * Fonte central de todos os ícones do projeto.
 * Uso:
 *   import { Icon } from "@/components/icons"
 *   import { VehicleIcon, StatusPaidIcon } from "@/components/icons"
 *
 * Regras:
 *   - Estilo: outline/stroke. Nunca fill.
 *   - strokeWidth padrão: 1.5 (20-24px) | 2 (32px+)
 *   - Cor padrão: currentColor (herda do container)
 *   - Cantos: strokeLinecap="round" strokeLinejoin="round"
 */

import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  Calendar,
  Car,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit,
  Eye,
  EyeOff,
  Filter,
  HelpCircle,
  History,
  Home,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  QrCode,
  Radio,
  RefreshCw,
  Search,
  Send,
  Share,
  Shield,
  ShieldCheck,
  Smartphone,
  Star,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
  XCircle,
  Zap,
} from "lucide-react";

export { PorticoIcon } from "./custom/PorticoIcon";
export { TagVeiculoIcon } from "./custom/TagIcon";
export { PlacaIcon } from "./custom/PlacaIcon";
export { PNUIcon } from "./custom/PNUIcon";
export { BrazilianRealIcon } from "./custom/BrazilianRealIcon";
export { FrotaIcon } from "./custom/FrotaIcon";

// ─────────────────────────────────────────────────────────────────────────────
// ALIASES SEMÂNTICOS — domínio Pedágio Simples
// ─────────────────────────────────────────────────────────────────────────────

/** Veículo / carro cadastrado */
export const VehicleIcon = Car;

/** Pedágio / pórtico Free Flow (usa Radio como fallback lucide para sinal DSRC) */
export const TollIcon = Radio;

/** Histórico de passagens */
export const HistoryIcon = History;

/** Débito / pendência em aberto */
export const DebtIcon = AlertTriangle;

/** Passagem quitada / paga */
export const PassagemPagaIcon = CheckCircle;

/** Multa de evasão */
export const MultaIcon = AlertCircle;

/** Pagamento via PIX */
export const PixIcon = QrCode;

/** Pagamento via cartão */
export const CardPaymentIcon = CreditCard;

/** Automação de pagamentos */
export const AutomacaoIcon = Zap;

/** Alertas inteligentes */
export const AlertaIcon = Bell;

/** Localização / endereço */
export const LocationIcon = MapPin;

/** Segurança / verificação */
export const SecurityIcon = Shield;

/** Segurança verificada / conta validada */
export const VerifiedIcon = ShieldCheck;

/** Prazo / vencimento */
export const PrazoIcon = Clock;

/** Concessionária / empresa */
export const ConcessionariaIcon = Building2;

/** Usuário / perfil */
export const UserIcon = User;

/** Novo usuário / cadastro */
export const RegisterIcon = UserPlus;

/** Grupo de usuários / frota multi-usuário */
export const UsersIcon = Users;

/** Login */
export const LoginIcon = LogIn;

/** Logout */
export const LogoutIcon = LogOut;

/** Configurações de notificações */
export const NotificationIcon = Bell;

/** Celular / app mobile */
export const MobileIcon = Smartphone;

/** Exportar / baixar comprovante */
export const ExportIcon = Download;

/** Compartilhar comprovante */
export const ShareIcon = Share;

/** Editar dados */
export const EditIcon = Edit;

/** Excluir */
export const DeleteIcon = Trash2;

/** Busca / consulta */
export const SearchIcon = Search;

/** Filtrar resultados */
export const FilterIcon = Filter;

/** Saldo / carteira */
export const WalletIcon = Wallet;

/** Estrela / veículo principal */
export const StarIcon = Star;

/** Carregando */
export const LoadingIcon = Loader2;

/** Copiar código */
export const CopyIcon = Copy;

/** Confirmação simples */
export const CheckIcon = Check;

/** Confirmação dupla / done */
export const DoneIcon = CheckCircle2;

/** Fechar / cancelar (X) */
export const CloseIcon = X;

/** Erro / inválido */
export const ErrorIcon = XCircle;

/** Voltar */
export const BackIcon = ArrowLeft;

/** Avançar */
export const ForwardIcon = ArrowRight;

/** Abrir menu */
export const MenuIcon = Menu;

/** Recarregar / tentar novamente */
export const RetryIcon = RefreshCw;

/** Ajuda / FAQ */
export const HelpIcon = HelpCircle;

/** Início / home */
export const HomeIcon = Home;

/** E-mail */
export const EmailIcon = Mail;

/** Telefone */
export const PhoneIcon = Phone;

/** Senha / cadeado */
export const PasswordIcon = Lock;

/** Revelar senha */
export const ShowPasswordIcon = Eye;

/** Ocultar senha */
export const HidePasswordIcon = EyeOff;

/** Calendário / data */
export const CalendarIcon = Calendar;

/** Subir / expandir */
export const ChevronUpIcon = ChevronUp;

/** Descer / recolher */
export const ChevronDownIcon = ChevronDown;

/** Anterior */
export const ChevronLeftIcon = ChevronLeft;

/** Próximo */
export const ChevronRightIcon = ChevronRight;

/** Adicionar */
export const AddIcon = Plus;

/** Remover */
export const RemoveIcon = Minus;

/** Upload */
export const UploadIcon = Upload;

/** Enviar mensagem */
export const SendIcon = Send;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE <Icon> — wrapper com defaults do design system
// ─────────────────────────────────────────────────────────────────────────────

interface IconProps {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

/**
 * Wrapper para ícones lucide com defaults do design system.
 * strokeWidth: 1.5 para ≤24px, 2 para ≥32px.
 *
 * Uso: <Icon icon={Car} size={20} className="text-[#5B2E8C]" />
 */
export function Icon({
  icon: LucideIconComponent,
  size = 20,
  strokeWidth,
  className,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: IconProps) {
  const resolvedStrokeWidth = strokeWidth ?? (size >= 32 ? 2 : 1.5);
  return (
    <LucideIconComponent
      size={size}
      strokeWidth={resolvedStrokeWidth}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? !ariaLabel}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAPA DE ÍCONES — para uso programático (ex: renderizar ícone por string)
// ─────────────────────────────────────────────────────────────────────────────

export const iconMap = {
  vehicle:        VehicleIcon,
  toll:           TollIcon,
  history:        HistoryIcon,
  debt:           DebtIcon,
  paid:           PassagemPagaIcon,
  fine:           MultaIcon,
  pix:            PixIcon,
  card:           CardPaymentIcon,
  automation:     AutomacaoIcon,
  alert:          AlertaIcon,
  location:       LocationIcon,
  security:       SecurityIcon,
  verified:       VerifiedIcon,
  deadline:       PrazoIcon,
  company:        ConcessionariaIcon,
  user:           UserIcon,
  register:       RegisterIcon,
  users:          UsersIcon,
  login:          LoginIcon,
  logout:         LogoutIcon,
  notification:   NotificationIcon,
  mobile:         MobileIcon,
  export:         ExportIcon,
  share:          ShareIcon,
  edit:           EditIcon,
  delete:         DeleteIcon,
  search:         SearchIcon,
  filter:         FilterIcon,
  wallet:         WalletIcon,
  star:           StarIcon,
  loading:        LoadingIcon,
  copy:           CopyIcon,
  check:          CheckIcon,
  done:           DoneIcon,
  close:          CloseIcon,
  error:          ErrorIcon,
  back:           BackIcon,
  forward:        ForwardIcon,
  menu:           MenuIcon,
  retry:          RetryIcon,
  help:           HelpIcon,
  home:           HomeIcon,
  email:          EmailIcon,
  phone:          PhoneIcon,
  password:       PasswordIcon,
  calendar:       CalendarIcon,
  add:            AddIcon,
  remove:         RemoveIcon,
  send:           SendIcon,
} as const;

export type IconName = keyof typeof iconMap;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE <NamedIcon> — renderiza por nome string
// ─────────────────────────────────────────────────────────────────────────────

interface NamedIconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-label"?: string;
}

/**
 * Renderiza um ícone pelo nome semântico.
 *
 * Uso: <NamedIcon name="vehicle" size={20} className="text-[#5B2E8C]" />
 */
export function NamedIcon({ name, size = 20, strokeWidth, className, "aria-label": ariaLabel }: NamedIconProps) {
  return (
    <Icon
      icon={iconMap[name]}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-label={ariaLabel}
    />
  );
}

// Re-exporta ícones lucide brutos para compatibilidade com código existente
export {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  Calendar,
  Car,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit,
  Eye,
  EyeOff,
  Filter,
  HelpCircle,
  History,
  Home,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  QrCode,
  Radio,
  RefreshCw,
  Search,
  Send,
  Share,
  Shield,
  ShieldCheck,
  Smartphone,
  Star,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
  XCircle,
  Zap,
};
