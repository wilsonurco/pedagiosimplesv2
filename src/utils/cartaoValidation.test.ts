import { describe, it, expect } from 'vitest'
import {
  detectarBandeira,
  validarLuhn,
  formatarNumeroCartao,
  formatarValidade,
  validarValidade,
} from './cartaoValidation'

describe('detectarBandeira', () => {
  it('detecta ELO por prefixos conhecidos', () => {
    expect(detectarBandeira('5067330000000001')).toBe('elo')
    expect(detectarBandeira('6516520000000000')).toBe('elo')
    expect(detectarBandeira('6550000000000000')).toBe('elo')
    expect(detectarBandeira('4011780000000000')).toBe('elo')
    expect(detectarBandeira('6362970000000000')).toBe('elo')
  })

  it('detecta Visa quando começa com 4 e não é ELO', () => {
    expect(detectarBandeira('4111111111111111')).toBe('visa')
    expect(detectarBandeira('4242424242424242')).toBe('visa')
  })

  it('detecta Mastercard nos ranges 51-55 e 2221-2720', () => {
    expect(detectarBandeira('5555555555554444')).toBe('master')
    expect(detectarBandeira('5105105105105100')).toBe('master')
    expect(detectarBandeira('2221000000000000')).toBe('master')
    expect(detectarBandeira('2720990000000000')).toBe('master')
  })

  it('retorna null para bandeiras não suportadas', () => {
    expect(detectarBandeira('3782822463100050')).toBeNull() // Amex
    expect(detectarBandeira('6011111111111117')).toBeNull() // Discover
    expect(detectarBandeira('')).toBeNull()
  })

  it('ignora espaços e traços no input', () => {
    expect(detectarBandeira('5067 3300 0000 0001')).toBe('elo')
    expect(detectarBandeira('4111-1111-1111-1111')).toBe('visa')
  })
})

describe('validarLuhn', () => {
  it('aceita números válidos', () => {
    expect(validarLuhn('4111111111111111')).toBe(true)
    expect(validarLuhn('5555555555554444')).toBe(true)
    expect(validarLuhn('5067 3300 0000 0000')).toBe(true)
  })

  it('rejeita números inválidos', () => {
    expect(validarLuhn('4111111111111112')).toBe(false)
    expect(validarLuhn('1234567890123456')).toBe(false)
    expect(validarLuhn('')).toBe(false)
  })
})

describe('formatarNumeroCartao', () => {
  it('aplica máscara de grupos de 4', () => {
    expect(formatarNumeroCartao('4111111111111111')).toBe('4111 1111 1111 1111')
    expect(formatarNumeroCartao('41111111')).toBe('4111 1111')
    expect(formatarNumeroCartao('4')).toBe('4')
  })

  it('remove caracteres não-numéricos antes de formatar', () => {
    expect(formatarNumeroCartao('41-11 abc 1111')).toBe('4111 1111')
  })

  it('limita a 19 dígitos (16 + 3 espaços = 19)', () => {
    expect(formatarNumeroCartao('41111111111111119999')).toBe('4111 1111 1111 1111')
  })
})

describe('formatarValidade', () => {
  it('aplica máscara MM/AA', () => {
    expect(formatarValidade('1230')).toBe('12/30')
    expect(formatarValidade('1')).toBe('1')
    expect(formatarValidade('12')).toBe('12')
    expect(formatarValidade('123')).toBe('12/3')
  })

  it('remove não-numéricos', () => {
    expect(formatarValidade('12/3')).toBe('12/3')
    expect(formatarValidade('aa12bb30')).toBe('12/30')
  })
})

describe('validarValidade', () => {
  it('aceita data futura', () => {
    expect(validarValidade('12/99')).toBe(true)
  })

  it('rejeita mês inválido', () => {
    expect(validarValidade('13/30')).toBe(false)
    expect(validarValidade('00/30')).toBe(false)
  })

  it('rejeita formato incompleto', () => {
    expect(validarValidade('12/3')).toBe(false)
    expect(validarValidade('')).toBe(false)
  })

  it('rejeita data passada', () => {
    expect(validarValidade('01/20')).toBe(false)
  })
})
