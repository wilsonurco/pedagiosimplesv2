import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Switch defaultChecked />,
};

export const ComLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="notif" defaultChecked />
      <Label htmlFor="notif">Receber alertas de novas passagens</Label>
    </div>
  ),
};

export const Configuracoes: Story = {
  name: 'Painel de configurações',
  render: () => (
    <div className="w-80 space-y-1 rounded-xl border border-[#ECECF1] p-4">
      {[
        { id: 's1', label: 'Notificações por e-mail', on: true },
        { id: 's2', label: 'Notificações por SMS', on: false },
        { id: 's3', label: 'Pagamento automático', on: true },
      ].map((item) => (
        <div key={item.id} className="flex items-center justify-between py-2">
          <Label htmlFor={item.id}>{item.label}</Label>
          <Switch id={item.id} defaultChecked={item.on} />
        </div>
      ))}
    </div>
  ),
};

export const Desabilitado: Story = {
  render: () => (
    <div className="flex items-center gap-2 opacity-60">
      <Switch id="dis" disabled />
      <Label htmlFor="dis">Indisponível no seu plano</Label>
    </div>
  ),
};
