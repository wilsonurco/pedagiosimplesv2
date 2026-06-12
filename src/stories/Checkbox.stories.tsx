import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Checkbox defaultChecked />,
};

export const ComLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="termos" defaultChecked />
      <Label htmlFor="termos">Aceito os termos de uso</Label>
    </div>
  ),
};

export const Estados: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox id="c1" />
        <Label htmlFor="c1">Desmarcado</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c2" defaultChecked />
        <Label htmlFor="c2">Marcado</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c3" disabled />
        <Label htmlFor="c3" className="opacity-50">Desabilitado</Label>
      </div>
    </div>
  ),
};

export const ListaDeSelecao: Story = {
  name: 'Lista de seleção (interativo)',
  render: () => {
    const itens = [
      { id: 'p1', label: 'SP-055 — KM 88', valor: 'R$ 12,50' },
      { id: 'p2', label: 'SP-330 — KM 45', valor: 'R$ 6,70' },
      { id: 'p3', label: 'SP-348 — KM 88', valor: 'R$ 9,60' },
    ];
    const [selecionados, setSelecionados] = useState<string[]>(['p1']);
    const toggle = (id: string) =>
      setSelecionados((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    return (
      <div className="w-72 space-y-2">
        {itens.map((item) => (
          <label
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-[#ECECF1] p-3 cursor-pointer hover:bg-[#F7F5FB]"
          >
            <span className="flex items-center gap-2">
              <Checkbox
                checked={selecionados.includes(item.id)}
                onCheckedChange={() => toggle(item.id)}
              />
              <span className="text-sm">{item.label}</span>
            </span>
            <span className="text-sm font-medium text-[#5B2E8C]">{item.valor}</span>
          </label>
        ))}
        <p className="text-xs text-muted-foreground">
          {selecionados.length} selecionada(s)
        </p>
      </div>
    );
  },
};
