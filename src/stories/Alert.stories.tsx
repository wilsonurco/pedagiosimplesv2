import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, CheckCircle, Info, Terminal } from 'lucide-react';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'Estilo visual do alerta',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <Terminal />
      <AlertTitle>Atualização disponível</AlertTitle>
      <AlertDescription>
        Uma nova versão do sistema está disponível. Recarregue a página para aplicar.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Alert {...args}>
      <AlertTriangle />
      <AlertTitle>Risco de multa</AlertTitle>
      <AlertDescription>
        Você tem passagens próximas do prazo de vencimento. Regularize para evitar penalidades.
      </AlertDescription>
    </Alert>
  ),
};

export const Sucesso: Story = {
  render: (args) => (
    <Alert className="border-[#A3D9BE] bg-[#D4F0E2] [&>svg]:text-[#0E8B5A]" {...args}>
      <CheckCircle />
      <AlertTitle className="text-[#085534]">Pagamento confirmado</AlertTitle>
      <AlertDescription className="text-[#0A6B45]">
        Suas pendências foram quitadas com sucesso.
      </AlertDescription>
    </Alert>
  ),
};

export const Informativo: Story = {
  render: (args) => (
    <Alert className="border-[#C9AEEA] bg-[#F4EFFB] [&>svg]:text-[#5B2E8C]" {...args}>
      <Info />
      <AlertTitle className="text-[#2E1547]">Como funciona o Free Flow</AlertTitle>
      <AlertDescription className="text-[#5B2E8C]">
        Pórticos sem cancela registram a passagem e geram um débito a ser quitado depois.
      </AlertDescription>
    </Alert>
  ),
};
