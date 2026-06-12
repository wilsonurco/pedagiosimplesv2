import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../components/ui/badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'risco', 'pendente', 'sucesso', 'info'],
      description: 'Estilo semântico do badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Variantes base (shadcn) ──────────────────────────────────────

export const Default: Story = {
  args: { children: 'Badge', variant: 'default' },
};

export const Secondary: Story = {
  args: { children: 'Secondary', variant: 'secondary' },
};

export const Destructive: Story = {
  args: { children: 'Destructive', variant: 'destructive' },
};

export const Outline: Story = {
  args: { children: 'Outline', variant: 'outline' },
};

// ─── Variantes semânticas (projeto) ──────────────────────────────

export const Risco: Story = {
  args: { children: 'Vence em breve', variant: 'risco' },
};

export const Pendente: Story = {
  args: { children: 'Pendente', variant: 'pendente' },
};

export const Sucesso: Story = {
  args: { children: 'Pago', variant: 'sucesso' },
};

export const Info: Story = {
  args: { children: 'Info', variant: 'info' },
};

// ─── Showcase semântico ───────────────────────────────────────────

export const SemanticShowcase: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <p className="text-xs text-[#5B5C68] mb-2 font-medium">Variantes Base</p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default">default</Badge>
          <Badge variant="secondary">secondary</Badge>
          <Badge variant="destructive">destructive</Badge>
          <Badge variant="outline">outline</Badge>
        </div>
      </div>
      <div>
        <p className="text-xs text-[#5B5C68] mb-2 font-medium">Variantes Semânticas</p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="risco">Vence em breve</Badge>
          <Badge variant="pendente">Pendente</Badge>
          <Badge variant="sucesso">Pago</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </div>
    </div>
  ),
};

// ─── Uso em contexto real ─────────────────────────────────────────

export const InContext: Story = {
  render: () => (
    <div className="flex flex-col gap-2 p-6 max-w-xs">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#1A1B23]">Passagem ABC-1234</span>
        <Badge variant="risco">Vence em breve</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#1A1B23]">Passagem XYZ-5678</span>
        <Badge variant="pendente">Pendente</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#1A1B23]">Passagem QRS-9012</span>
        <Badge variant="sucesso">Pago</Badge>
      </div>
    </div>
  ),
};
