import { describe, it, expect } from 'vitest'
import { gerarDebitos, agregarPorTipo, filtrarPorTipo, filtrarPorStatus, proximoVencimento } from './simulator'

describe('gerarDebitos — cenários nomeados', () => {
  it('ABC-1234 retorna mix de 2 praças SPMAR + 3 pórticos Free Flow', () => {
    const passagens = gerarDebitos('ABC-1234')
    const pracas = passagens.filter(p => p.tipo === 'praca_fisica')
    const porticos = passagens.filter(p => p.tipo === 'portico_free_flow')
    expect(pracas).toHaveLength(2)
    expect(porticos).toHaveLength(3)
    pracas.forEach(p => expect(p.concessionaria).toBe('SPMAR'))
  })

  it('XYZ-5678 retorna apenas 1 praça física SPMAR', () => {
    const passagens = gerarDebitos('XYZ-5678')
    expect(passagens).toHaveLength(1)
    expect(passagens[0].tipo).toBe('praca_fisica')
    expect(passagens[0].concessionaria).toBe('SPMAR')
  })

  it('DEF-9012 retorna apenas 4 pórticos Free Flow da SP-330', () => {
    const passagens = gerarDebitos('DEF-9012')
    expect(passagens).toHaveLength(4)
    passagens.forEach(p => {
      expect(p.tipo).toBe('portico_free_flow')
      expect(p.rodovia).toBe('SP-330')
    })
  })

  it('GHI-3456 retorna 8 passagens mistas todas em risco de multa', () => {
    const passagens = gerarDebitos('GHI-3456')
    expect(passagens).toHaveLength(8)
    passagens.forEach(p => expect(p.status).toBe('risco_multa'))
  })

  it('JKL-7890 retorna array vazio (happy path)', () => {
    expect(gerarDebitos('JKL-7890')).toEqual([])
  })

  it('mesma placa sempre retorna mesmo resultado (determinístico)', () => {
    const a = gerarDebitos('ABC-1234')
    const b = gerarDebitos('ABC-1234')
    expect(a).toEqual(b)
  })

  it('cada passagem tem id único', () => {
    const passagens = gerarDebitos('ABC-1234')
    const ids = passagens.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('placa da passagem bate com a placa consultada', () => {
    const passagens = gerarDebitos('ABC-1234')
    passagens.forEach(p => expect(p.placa).toBe('ABC-1234'))
  })
})

describe('gerarDebitos — placa desconhecida (random determinístico)', () => {
  it('placa desconhecida retorna entre 1 e 5 passagens', () => {
    const passagens = gerarDebitos('ZZZ-9999')
    expect(passagens.length).toBeGreaterThanOrEqual(1)
    expect(passagens.length).toBeLessThanOrEqual(5)
  })

  it('mesma placa desconhecida sempre retorna mesmo resultado', () => {
    const a = gerarDebitos('ZZZ-9999')
    const b = gerarDebitos('ZZZ-9999')
    expect(a).toEqual(b)
  })

  it('placas diferentes retornam resultados diferentes', () => {
    const a = gerarDebitos('AAA-1111')
    const b = gerarDebitos('BBB-2222')
    expect(a).not.toEqual(b)
  })
})

describe('agregarPorTipo', () => {
  it('agrega corretamente passagens mistas', () => {
    const passagens = gerarDebitos('ABC-1234')
    const r = agregarPorTipo(passagens)
    expect(r.countPraca).toBe(2)
    expect(r.countPortico).toBe(3)
    expect(r.countTotal).toBe(5)
    expect(r.totalPraca).toBeCloseTo(25.00)
    expect(r.totalPortico).toBeCloseTo(40.00)
    expect(r.totalGeral).toBeCloseTo(65.00)
  })

  it('retorna zeros para lista vazia', () => {
    const r = agregarPorTipo([])
    expect(r).toEqual({
      countPraca: 0, countPortico: 0, countTotal: 0,
      totalPraca: 0, totalPortico: 0, totalGeral: 0,
    })
  })
})

describe('filtrarPorTipo', () => {
  it('filtra apenas praças', () => {
    const passagens = gerarDebitos('ABC-1234')
    const r = filtrarPorTipo(passagens, 'praca_fisica')
    expect(r).toHaveLength(2)
    r.forEach(p => expect(p.tipo).toBe('praca_fisica'))
  })

  it('sem filtro retorna tudo', () => {
    const passagens = gerarDebitos('ABC-1234')
    expect(filtrarPorTipo(passagens)).toEqual(passagens)
  })
})

describe('filtrarPorStatus', () => {
  it('filtra apenas risco_multa', () => {
    const passagens = gerarDebitos('ABC-1234')
    const r = filtrarPorStatus(passagens, 'risco_multa')
    r.forEach(p => expect(p.status).toBe('risco_multa'))
  })
})

describe('proximoVencimento', () => {
  it('retorna a passagem com prazo mais próximo', () => {
    const passagens = gerarDebitos('ABC-1234')
    const r = proximoVencimento(passagens)
    expect(r).not.toBeNull()
    // ABC-1234 tem 'abc-portico-1' com prazo +5 dias, deve ser o mais próximo
    expect(r?.id).toBe('abc-portico-1')
  })

  it('retorna null para lista vazia', () => {
    expect(proximoVencimento([])).toBeNull()
  })
})
