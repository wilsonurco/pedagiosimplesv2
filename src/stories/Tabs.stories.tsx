import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { QrCode, CreditCard } from 'lucide-react';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="pendencias">
      <TabsList>
        <TabsTrigger value="pendencias">Pendências</TabsTrigger>
        <TabsTrigger value="pagos">Pagos</TabsTrigger>
        <TabsTrigger value="veiculos">Veículos</TabsTrigger>
      </TabsList>
      <TabsContent value="pendencias" className="pt-4 text-sm text-muted-foreground">
        Você tem 3 passagens em aberto.
      </TabsContent>
      <TabsContent value="pagos" className="pt-4 text-sm text-muted-foreground">
        Histórico de pagamentos realizados.
      </TabsContent>
      <TabsContent value="veiculos" className="pt-4 text-sm text-muted-foreground">
        Veículos cadastrados na sua conta.
      </TabsContent>
    </Tabs>
  ),
};

export const MetodoPagamento: Story = {
  name: 'Método de pagamento',
  render: () => (
    <Tabs defaultValue="pix">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pix" className="flex items-center gap-2">
          <QrCode className="h-4 w-4" /> PIX
        </TabsTrigger>
        <TabsTrigger value="cartao" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" /> Cartão
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pix" className="pt-4">
        <div className="rounded-lg border border-[#ECECF1] p-6 text-center text-sm text-muted-foreground">
          Escaneie o QR Code no app do seu banco.
        </div>
      </TabsContent>
      <TabsContent value="cartao" className="pt-4">
        <div className="rounded-lg border border-[#ECECF1] p-6 text-center text-sm text-muted-foreground">
          Informe os dados do cartão de crédito.
        </div>
      </TabsContent>
    </Tabs>
  ),
};
