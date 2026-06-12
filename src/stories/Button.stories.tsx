import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, Loader2, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'ghost', 'outline', 'link'],
      description: 'Estilo visual do botão',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Tamanho do botão',
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Variantes ───────────────────────────────────────────────────

export const Primary: Story = {
  args: { children: 'Prosseguir para Pagamento' },
};

export const Secondary: Story = {
  args: { children: 'Cancelar', variant: 'secondary' },
};

export const Destructive: Story = {
  args: { children: 'Excluir conta', variant: 'destructive' },
};

export const Ghost: Story = {
  args: { children: 'Ver detalhes', variant: 'ghost' },
};

export const Outline: Story = {
  args: { children: 'Adicionar veículo', variant: 'outline' },
};

export const Link: Story = {
  args: { children: 'Ver histórico completo', variant: 'link' },
};

// ─── Estados ─────────────────────────────────────────────────────

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <ArrowRight className="mr-2 h-4 w-4" />
      Prosseguir para Pagamento
    </Button>
  ),
};

export const Loading: Story = {
  render: () => (
    <Button disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Processando…
    </Button>
  ),
};

export const Disabled: Story = {
  args: { children: 'Prosseguir para Pagamento', disabled: true },
};

// ─── Tamanhos ────────────────────────────────────────────────────

export const Small: Story = {
  args: { children: 'Adicionar', size: 'sm' },
};

export const Large: Story = {
  args: { children: 'Pagar Agora', size: 'lg' },
};

export const Icon: Story = {
  args: { size: 'icon', 'aria-label': 'Adicionar' },
  render: (args) => (
    <Button {...args}>
      <Plus className="h-4 w-4" />
    </Button>
  ),
};

// ─── Showcase completo ───────────────────────────────────────────

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3 items-start p-6">
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-6">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
