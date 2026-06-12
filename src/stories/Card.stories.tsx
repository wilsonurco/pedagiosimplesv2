import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Estrutura base ───────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Placa ABC-1234</CardTitle>
        <CardDescription>3 débitos pendentes encontrados</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[#5B5C68]">Total: R$ 247,50</p>
      </CardContent>
    </Card>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Placa ABC-1234</CardTitle>
          <Badge variant="risco">Vence em breve</Badge>
        </div>
        <CardDescription>Rodovia dos Bandeirantes · SP</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#5B2E8C]">R$ 82,50</div>
        <p className="text-xs text-[#5B5C68] mt-1">Vencimento: 02/06/2026</p>
      </CardContent>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Resumo</CardTitle>
        <CardDescription>2 de 3 pendências selecionadas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center bg-[#5B2E8C] text-white rounded-lg p-4">
          <span className="font-semibold text-sm">Total a Pagar</span>
          <span className="font-bold text-xl">R$ 165,00</span>
        </div>
        <Button className="w-full">Prosseguir para Pagamento</Button>
      </CardContent>
    </Card>
  ),
};

export const Empty: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-[#F4EFFB] flex items-center justify-center mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <CardTitle className="mb-2">Tudo em dia!</CardTitle>
        <CardDescription>Nenhuma pendência encontrada para este veículo.</CardDescription>
      </CardContent>
    </Card>
  ),
};
