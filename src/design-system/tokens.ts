/**
 * PEDÁGIO SIMPLES — Design System Tokens
 * Move Mais Meios de Pagamento
 *
 * Fonte de verdade única para uso no codebase TypeScript/React.
 * Estes tokens espelham as CSS custom properties definidas em globals.css
 * e devem ser mantidos em sincronia com o arquivo Figma e os W3C Design Tokens (.json).
 *
 * Versão: 1.0  |  Idioma: pt-BR
 */

// ─────────────────────────────────────────────────────────────────────────────
// CORES
// ─────────────────────────────────────────────────────────────────────────────

/** Cores primárias institucionais */
export const colors = {

  // ── Violeta (cor institucional principal) ──────────────────────────────────
  /** Violeta Pedágio — cor principal. CTAs, símbolo, headers. Contraste 9.8:1 sobre off-white. */
  "violeta-700": "#5B2E8C",
  /** Violeta Elétrico — hover de CTA, links ativos, ring de foco. Usar apenas 14px bold+ ou 18px+ para textos. */
  "violeta-500": "#8B5FFF",
  /** Violeta Profundo — backgrounds escuros, modo dark, autoridade institucional. */
  "violeta-900": "#2E1547",

  // ── Grafite (textos e ícones) ──────────────────────────────────────────────
  /** Grafite — texto principal, ícones de UI. Tem trace de azul-violeta para coesão com o violeta. */
  "grafite-900": "#1A1B23",
  /** Grafite Médio — texto secundário, labels, rodapés. */
  "cinza-600":   "#5B5C68",

  // ── Neutros ───────────────────────────────────────────────────────────────
  /** Areia Digital — background principal do produto. */
  "off-white":   "#F7F5FB",
  /** Concreto Claro — bordas, divisores, placeholders. */
  "cinza-300":   "#C6C7CF",
  /** Bruma — background de inputs, cards secundários. */
  "cinza-100":   "#ECECF1",

  // ── Semânticas de UI ──────────────────────────────────────────────────────
  /** Pago / OK — pagamento confirmado, estado de sucesso. */
  "verde-success":   "#0E8B5A",
  /** Pendente — débitos em aberto, alertas não-críticos. */
  "ambar-warning":   "#C77700",
  /** Erro / Bloqueio — falha de pagamento, dados inválidos. Matiz quente, não saturado. */
  "vermelho-error":  "#C8324A",

} as const;

/** Alias semânticos para uso direto em componentes */
export const semanticColors = {
  /** Cor principal da marca — usar em CTAs primários, símbolo, headings de destaque */
  brand:           colors["violeta-700"],
  /** Hover e foco de elementos interativos */
  brandHover:      colors["violeta-500"],
  /** Backgrounds escuros / modo dark */
  brandDark:       colors["violeta-900"],

  /** Fundo principal da aplicação */
  background:      colors["off-white"],
  /** Fundo de inputs e cards secundários */
  surface:         colors["cinza-100"],

  /** Texto de alto contraste (principal) */
  textPrimary:     colors["grafite-900"],
  /** Texto de médio contraste (secundário, labels, metadados) */
  textSecondary:   colors["cinza-600"],
  /** Texto sobre fundos violeta — sempre branco */
  textOnBrand:     "#FFFFFF",

  /** Bordas e divisores */
  border:          colors["cinza-300"],
  /** Placeholders de input */
  placeholder:     colors["cinza-300"],

  /** Estado: sucesso / pagamento confirmado */
  success:         colors["verde-success"],
  /** Estado: atenção / pendência */
  warning:         colors["ambar-warning"],
  /** Estado: erro / bloqueio */
  error:           colors["vermelho-error"],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TIPOGRAFIA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Famílias tipográficas.
 * Prioridade: Geist Sans > Inter > fallback sans-serif do sistema.
 * Geist Mono para todos os elementos técnicos (placas, valores, códigos).
 */
export const fontFamily = {
  /** Display, texto corrido, UI e labels */
  sans: "'Geist Sans', 'Inter', 'Inter Display', system-ui, -apple-system, sans-serif",
  /** Placas veiculares, valores monetários, códigos de transação, números de boleto */
  mono: "'Geist Mono', 'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
} as const;

/** Pesos tipográficos utilizados no sistema */
export const fontWeight = {
  regular:   400,
  medium:    500,
  semibold:  600,
  bold:      700,
} as const;

/**
 * Escala tipográfica.
 * Valores em rem (base 16px).
 * Usar como referência — as classes Tailwind (text-sm, text-base etc.) são equivalentes.
 */
export const fontSize = {
  /** Labels de form, legendas, metadados */
  xs:    "0.75rem",   //  12px
  /** Labels de UI, texto secundário compacto */
  sm:    "0.875rem",  //  14px
  /** Corpo de texto principal, descrições */
  base:  "1rem",      //  16px
  /** Subheadings, texto de destaque */
  lg:    "1.125rem",  //  18px
  /** Subtítulos de seção */
  xl:    "1.25rem",   //  20px
  "2xl": "1.5rem",    //  24px — valores monetários em mono, títulos de card
  "3xl": "1.875rem",  //  30px — headlines secundários
  "4xl": "2.25rem",   //  36px — headlines de página
  "5xl": "3rem",      //  48px — hero subheadline
  "6xl": "3.75rem",   //  60px — hero headline
  "7xl": "4.5rem",    //  72px — display máximo
} as const;

/** Line heights padrão */
export const lineHeight = {
  tight:   1.2,  // headlines e títulos
  snug:    1.35, // subtítulos
  normal:  1.5,  // corpo de texto
  relaxed: 1.625 // textos longos / help text
} as const;

/** Letter spacing (tracking) */
export const letterSpacing = {
  /** Wordmark do logo */
  logo:     "-0.015em",
  /** Textos de display */
  tight:    "-0.01em",
  /** Padrão */
  normal:   "0em",
  /** Labels de UI em uppercase */
  wide:     "0.05em",
  /** Placas veiculares em mono */
  placa:    "0.05em",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ESPAÇAMENTO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escala de espaçamento (múltiplos de 4px — base do grid de 4pt).
 * Estes valores mapeiam diretamente para as classes Tailwind (p-1 = 4px, p-4 = 16px etc.).
 */
export const spacing = {
  0:    "0px",
  1:    "4px",
  2:    "8px",
  3:    "12px",
  4:    "16px",
  5:    "20px",
  6:    "24px",
  8:    "32px",
  10:   "40px",
  12:   "48px",
  16:   "64px",
  20:   "80px",
  24:   "96px",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────────────────────

export const borderRadius = {
  none:  "0px",
  sm:    "4px",
  md:    "8px",   // padrão de componentes (inputs, cards, badges)
  lg:    "12px",  // cards maiores, modais
  xl:    "16px",
  "2xl": "24px",  // modais e sheets mobile
  full:  "9999px" // badges de status, avatares, pills
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SOMBRAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sombras discretas — a identidade é "flat-first".
 * Nunca usar sombras no logo ou símbolo.
 */
export const boxShadow = {
  sm:   "0 1px 2px 0 rgba(26, 27, 35, 0.06)",
  md:   "0 4px 6px -1px rgba(26, 27, 35, 0.08), 0 2px 4px -1px rgba(26, 27, 35, 0.04)",
  lg:   "0 10px 15px -3px rgba(26, 27, 35, 0.08), 0 4px 6px -2px rgba(26, 27, 35, 0.04)",
  /** Sombra de card com tom violeta — uso em cards primários de destaque */
  brand: "0 4px 24px 0 rgba(91, 46, 140, 0.12)",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES — ESPECIFICAÇÕES
// ─────────────────────────────────────────────────────────────────────────────

/** Especificações do componente Button */
export const button = {
  /** Altura padrão dos botões */
  height: {
    sm:   "36px",
    md:   "44px",  // padrão — mínimo para área de toque (WCAG 2.5.5)
    lg:   "52px",  // CTA principal de hero
  },
  /** Padding horizontal */
  paddingX: {
    sm:   "12px",
    md:   "20px",
    lg:   "32px",
  },
  borderRadius: borderRadius.md,
  fontWeight:   fontWeight.semibold,
  fontSize:     { sm: fontSize.sm, md: fontSize.base, lg: fontSize.lg },

  /** Variantes de cor */
  variants: {
    primary: {
      background:      colors["violeta-700"],
      backgroundHover: colors["violeta-500"],
      text:            "#FFFFFF",
    },
    secondary: {
      background:      colors["cinza-100"],
      backgroundHover: colors["cinza-300"],
      text:            colors["grafite-900"],
    },
    ghost: {
      background:      "transparent",
      backgroundHover: colors["cinza-100"],
      text:            colors["grafite-900"],
    },
    destructive: {
      background:      colors["vermelho-error"],
      backgroundHover: "#a82840",
      text:            "#FFFFFF",
    },
  },
} as const;

/** Especificações do componente Input padrão */
export const input = {
  height:           "44px",
  paddingX:         "16px",
  paddingY:         "12px",
  borderRadius:     borderRadius.md,
  borderWidth:      "1.5px",
  borderColor:      colors["cinza-300"],
  borderColorFocus: colors["violeta-700"],
  background:       colors["cinza-100"],
  fontSize:         fontSize.base,
  fontWeight:       fontWeight.regular,
  placeholderColor: colors["cinza-300"],
  textColor:        colors["grafite-900"],
} as const;

/**
 * Componente Input Placa — tratamento especial para placa veicular.
 * Padrão Mercosul (ABC1D23) e padrão antigo (ABC-1234).
 */
export const inputPlaca = {
  ...input,
  fontFamily:    fontFamily.mono,
  fontSize:      fontSize["2xl"],  // 24px mínimo; até 40px em contextos de destaque
  fontWeight:    fontWeight.bold,
  letterSpacing: letterSpacing.placa,
  textAlign:     "center" as const,
  textTransform: "uppercase" as const,
  /** Container opcional com visual de placa */
  container: {
    borderRadius:  borderRadius.md,
    borderWidth:   "1.5px",
    borderColor:   colors["cinza-300"],
    paddingX:      "16px",
    paddingY:      "12px",
    /** Faixa azul superior para variação Mercosul — usar só quando diferenciação é relevante */
    mercosulStripe: {
      height:     "6px",
      background: "#003399",
    },
  },
} as const;

/** Especificações do componente Badge de status */
export const badge = {
  borderRadius: borderRadius.full,
  paddingX:     "10px",
  paddingY:     "4px",
  fontSize:     fontSize.xs,
  fontWeight:   fontWeight.semibold,
  variants: {
    success: { background: "#D1FAE5", text: colors["verde-success"] },
    warning: { background: "#FEF3C7", text: colors["ambar-warning"] },
    error:   { background: "#FCE7EC", text: colors["vermelho-error"] },
    neutral: { background: colors["cinza-100"],  text: colors["cinza-600"]   },
    brand:   { background: "#EDE7F6", text: colors["violeta-700"] },
  },
} as const;

/** Especificações do componente Card */
export const card = {
  borderRadius: borderRadius.lg,
  borderWidth:  "1px",
  borderColor:  colors["cinza-300"],
  background:   "#FFFFFF",
  padding:      spacing[6],   // 24px
  shadow:       boxShadow.md,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ICONOGRAFIA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Biblioteca: Lucide Icons (MIT).
 * Estilo: outline / stroke. Nunca preenchido.
 */
export const icon = {
  /** Espessura de traço por tamanho */
  strokeWidth: {
    "16": 1.5,
    "20": 1.5,
    "24": 1.5,
    "32": 2,
    "48": 2,
  },
  /** Cor padrão */
  colorDefault: colors["grafite-900"],
  /** Cor em estado ativo / selecionado */
  colorActive:  colors["violeta-700"],
  /** Cantos arredondados */
  strokeLinejoin: "round" as const,
  strokeLinecap:  "round" as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ACESSIBILIDADE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ratios de contraste WCAG 2.1.
 * Todos os pares abaixo atendem AA (mínimo 4.5:1 para texto normal, 3:1 para texto grande).
 */
export const contrastRatios = {
  /** violeta-700 (#5B2E8C) sobre off-white (#F7F5FB) — 9.8:1 — atende AAA */
  brandOnBackground: 9.8,
  /** grafite-900 (#1A1B23) sobre off-white (#F7F5FB) — 15.2:1 — atende AAA */
  textOnBackground:  15.2,
  /**
   * violeta-500 (#8B5FFF) — NÃO usar como texto contínuo sobre off-white.
   * Usar apenas 14px bold+ ou 18px+ para atender AA.
   */
  brandHoverWarning: "usar apenas 14px bold+ ou 18px+",
} as const;

/** Tamanho mínimo de área de toque (WCAG 2.5.5) */
export const minTouchTarget = "44px";

// ─────────────────────────────────────────────────────────────────────────────
// LOGO — TAMANHOS MÍNIMOS E MARGENS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unidade "x" = altura da letra "p" do wordmark na escala de uso.
 * Margem de segurança mínima ao redor do logo: 1x em todos os lados.
 */
export const logo = {
  sizes: {
    /** Símbolo isolado — favicon simplificado */
    faviconMin:    "16px",
    /** Símbolo isolado — app icon */
    symbolMin:     "48px",
    /** Logo horizontal — uso em header */
    horizontalMin: "24px",
    /** Logo empilhado */
    stackedMin:    "64px",
    /** Wordmark isolado */
    wordmarkMin:   "14px",
  },
  /** Variações de cor permitidas */
  colorVariants: {
    default:      colors["violeta-700"],
    white:        "#FFFFFF",  // sobre fundos escuros e fotografias
    black:        "#000000",  // documentos legais, comprovantes
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ANIMAÇÃO / TRANSIÇÕES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Durações e easings padrão.
 * A identidade é sóbria — evitar animações chamativas.
 */
export const motion = {
  duration: {
    fast:    "150ms",
    normal:  "250ms",
    slow:    "400ms",
    hero:    "600ms",  // entrada de elementos de hero (framer-motion)
  },
  easing: {
    default:  "cubic-bezier(0.4, 0, 0.2, 1)",  // ease-in-out suave
    enter:    "cubic-bezier(0, 0, 0.2, 1)",     // ease-out
    exit:     "cubic-bezier(0.4, 0, 1, 1)",     // ease-in
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// BREAKPOINTS (RESPONSIVO)
// ─────────────────────────────────────────────────────────────────────────────

export const breakpoints = {
  sm:  "640px",
  md:  "768px",
  lg:  "1024px",
  xl:  "1280px",
  "2xl": "1536px",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// RESTRIÇÕES DE MARCA (RED FLAGS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cores PROIBIDAS como cor principal (concorrentes diretos).
 * Permitidas APENAS nas funções semânticas de UI (success, warning, error).
 */
export const forbiddenPrimaryColors = {
  semParar:    "#FF6600",  // laranja
  conectcar:   "#CC0000",  // vermelho saturado
  veloe:       "#006B8F",  // azul-petróleo
  greenpass:   "#008000",  // verde
  taggy:       "#FFD700",  // amarelo
} as const;

/**
 * Vocabulário PROIBIDO em naming, taglines e microcopy institucional.
 * (podem aparecer em texto explicativo como palavras técnicas, nunca como marca)
 */
export const forbiddenVocabulary = [
  "sem parar", "sem-parar",
  "conect", "conectcar",
  "veloe",
  "greenpass",
  "taggy", "tague",
] as const;

/**
 * Símbolos PROIBIDOS no logo e identidade.
 */
export const forbiddenSymbols = [
  "pin de geolocalização",
  "carro estilizado",
  "cancela de pedágio literal",
  "cifrão / ícone de dinheiro como símbolo principal",
  "estrada, asfalto, faixas de rolagem",
  "mascote ou personagem",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT AGRUPADO
// ─────────────────────────────────────────────────────────────────────────────

const tokens = {
  colors,
  semanticColors,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  spacing,
  borderRadius,
  boxShadow,
  button,
  input,
  inputPlaca,
  badge,
  card,
  icon,
  logo,
  motion,
  breakpoints,
  contrastRatios,
  minTouchTarget,
} as const;

export default tokens;
