/**
 * Mocks e helpers compartilhados entre as stories do Storybook.
 *
 * Centraliza dados de exemplo (débitos, usuário, veículo) e utilitários
 * (formatCurrency, noop) para evitar duplicação e manter consistência
 * visual entre as histórias dos componentes de domínio.
 */
import type { Passagem } from '../utils/simulator';

/** Formata um número para moeda brasileira (R$). */
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/** Callback vazio reutilizável para props obrigatórias de evento. */
export const noop = () => {};

/** Action logger simples — exibe no console qual handler foi disparado. */
export const action =
  (name: string) =>
  (...args: unknown[]) =>
    // eslint-disable-next-line no-console
    console.log(`[story:action] ${name}`, ...args);

/** Usuário de exemplo (mock de sessão autenticada). */
export const mockUsuario = {
  nome: 'Maria Oliveira',
  email: 'maria.oliveira@email.com',
  cpf: '123.456.789-00',
  telefone: '(11) 98765-4321',
};

/** Veículo de exemplo. */
export const mockVeiculo = {
  placa: 'ABC-1234',
  modelo: 'Honda Civic',
  cor: 'Prata',
  categoria: 'Carro de passeio',
};

/** Passagens de exemplo, cobrindo praça física e pórtico free flow. */
export const mockPassagens: Passagem[] = [
  {
    id: 'mock-praca-1',
    tipo: 'praca_fisica',
    local: 'Praça de Pedágio SP-055 — KM 88',
    concessionaria: 'DER-SP',
    rodovia: 'SP-055',
    km: 88,
    data: '15/01/2025',
    hora: '14:32:07',
    valor: 12.5,
    categoria: 'Carro de passeio',
    placa: 'ABC-1234',
    status: 'em_prazo',
    prazoLimite: '30/06/2026',
  },
  {
    id: 'mock-portico-1',
    tipo: 'portico_free_flow',
    local: 'Pórtico Free Flow SP-330 — KM 45',
    concessionaria: 'CCR AutoBAn',
    rodovia: 'SP-330',
    km: 45,
    data: '14/01/2025',
    hora: '16:05:44',
    valor: 6.7,
    categoria: 'Carro de passeio',
    placa: 'ABC-1234',
    status: 'risco_multa',
    prazoLimite: '02/06/2026',
  },
  {
    id: 'mock-portico-2',
    tipo: 'portico_free_flow',
    local: 'Pórtico Free Flow SP-348 — KM 88',
    concessionaria: 'Rota das Bandeiras',
    rodovia: 'SP-348',
    km: 88,
    data: '12/01/2025',
    hora: '09:18:43',
    valor: 9.6,
    categoria: 'Carro de passeio',
    placa: 'ABC-1234',
    status: 'em_prazo',
    prazoLimite: '28/06/2026',
  },
];

/** Soma do valor das passagens de exemplo (arredondada para 2 casas). */
export const mockValorTotal =
  Math.round(mockPassagens.reduce((sum, p) => sum + p.valor, 0) * 100) / 100;
