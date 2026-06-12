import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResultadosDebitos } from '../components/ResultadosDebitos';
import { action, mockVeiculo } from './_mocks';

/**
 * Tela de resultados da consulta de débitos. Gera as passagens internamente
 * a partir da placa (utils/simulator). A visão muda conforme `isAuthenticated`:
 * autenticado vê a lista completa e pode pagar; não autenticado vê o conteúdo
 * borrado com CTA de cadastro/login.
 */
const meta = {
  title: 'Components/ResultadosDebitos',
  component: ResultadosDebitos,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    onBack: action('onBack'),
    onPagar: action('onPagar'),
    onCadastrar: action('onCadastrar'),
    onLogin: action('onLogin'),
    dadosVeiculo: mockVeiculo,
    isAuthenticated: false,
  },
  argTypes: {
    isAuthenticated: { control: 'boolean' },
  },
} satisfies Meta<typeof ResultadosDebitos>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Visão pública — detalhes bloqueados com CTA de cadastro/login. */
export const NaoAutenticado: Story = {
  name: 'Não autenticado (bloqueado)',
  args: { isAuthenticated: false },
};

/** Visão logada — lista completa e seleção para pagamento. */
export const Autenticado: Story = {
  name: 'Autenticado (lista completa)',
  args: { isAuthenticated: true },
};

/** Placa sem débitos — estado vazio. */
export const SemDebitos: Story = {
  name: 'Sem débitos',
  args: { isAuthenticated: true, dadosVeiculo: { placa: 'SEM-0000' } },
};
