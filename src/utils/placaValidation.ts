/**
 * Utilitários para validação de placas brasileiras
 * Suporta formato antigo (ABC-1234) e Mercosul (ABC1D23)
 */

export interface PlacaValidationResult {
  isValid: boolean;
  formatted: string;
  type: 'antiga' | 'mercosul' | null;
  error?: string;
}

/**
 * Valida e formata uma placa brasileira
 * @param placa - Placa a ser validada (com ou sem formatação)
 * @returns Objeto com informações sobre a validação
 */
export function validarPlaca(placa: string): PlacaValidationResult {
  // Remove espaços e converte para maiúsculas
  const placaLimpa = placa.replace(/\s/g, '').toUpperCase();
  
  // Remove hífen se existir para facilitar validação
  const placaSemHifen = placaLimpa.replace(/-/g, '');
  
  // Padrão antigo: 3 letras + 4 números (ABC1234)
  const padraoAntigo = /^[A-Z]{3}[0-9]{4}$/;
  
  // Padrão Mercosul: 3 letras + 1 número + 1 letra + 2 números (ABC1D23)
  const padraoMercosul = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;
  
  // Validar formato antigo
  if (padraoAntigo.test(placaSemHifen)) {
    return {
      isValid: true,
      formatted: `${placaSemHifen.slice(0, 3)}-${placaSemHifen.slice(3)}`,
      type: 'antiga'
    };
  }
  
  // Validar formato Mercosul
  if (padraoMercosul.test(placaSemHifen)) {
    return {
      isValid: true,
      formatted: placaSemHifen, // Mercosul não usa hífen
      type: 'mercosul'
    };
  }
  
  // Se chegou aqui, a placa é inválida
  let error = 'Placa inválida';
  
  if (placaSemHifen.length < 7) {
    error = 'Placa incompleta';
  } else if (placaSemHifen.length > 7) {
    error = 'Placa muito longa';
  } else {
    error = 'Formato inválido. Use ABC-1234 ou ABC1D23';
  }
  
  return {
    isValid: false,
    formatted: placaLimpa,
    type: null,
    error
  };
}

/**
 * Formata a placa enquanto o usuário digita
 * @param valor - Valor atual do input
 * @returns Valor formatado
 */
export function formatarPlacaInput(valor: string): string {
  // Remove caracteres não alfanuméricos
  let limpo = valor.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Limita a 7 caracteres
  limpo = limpo.slice(0, 7);
  
  // Se tem exatamente 7 caracteres, tenta formatar
  if (limpo.length === 7) {
    // Verifica se é formato antigo (3 letras + 4 números)
    if (/^[A-Z]{3}[0-9]{4}$/.test(limpo)) {
      return `${limpo.slice(0, 3)}-${limpo.slice(3)}`;
    }
    // Se é Mercosul, retorna sem hífen
    return limpo;
  }
  
  // Para inputs em andamento, adiciona hífen se tiver mais de 3 caracteres e for formato antigo
  if (limpo.length > 3 && /^[A-Z]{3}[0-9]/.test(limpo)) {
    return `${limpo.slice(0, 3)}-${limpo.slice(3)}`;
  }
  
  return limpo;
}

/**
 * Verifica se a placa está completa e válida
 * @param placa - Placa a ser verificada
 * @returns True se a placa está completa e válida
 */
export function isPlacaCompleta(placa: string): boolean {
  const result = validarPlaca(placa);
  return result.isValid;
}
