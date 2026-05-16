import { describe, it, expect } from 'vitest'
import { gerarDebitos } from './simulator'

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
