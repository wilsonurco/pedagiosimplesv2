import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from '../components/ui/separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-72">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Resumo do pagamento</h4>
        <p className="text-sm text-muted-foreground">3 passagens selecionadas</p>
      </div>
      <Separator className="my-4" />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold text-[#5B2E8C]">R$ 28,80</span>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-3 text-sm">
      <span>PIX</span>
      <Separator orientation="vertical" />
      <span>Cartão</span>
      <Separator orientation="vertical" />
      <span>Boleto</span>
    </div>
  ),
};
