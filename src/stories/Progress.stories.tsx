import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Progress } from '../components/ui/progress';

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  args: { value: 60 },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Animado: Story = {
  name: 'Animado (auto)',
  render: () => {
    const [value, setValue] = useState(10);
    useEffect(() => {
      const t = setInterval(() => setValue((v) => (v >= 100 ? 10 : v + 10)), 800);
      return () => clearInterval(t);
    }, []);
    return (
      <div className="space-y-2">
        <Progress value={value} />
        <p className="text-xs text-muted-foreground">Processando pagamento... {value}%</p>
      </div>
    );
  },
};

export const Etapas: Story = {
  render: () => (
    <div className="space-y-4">
      {[
        { label: 'Cadastro', value: 100 },
        { label: 'Veículos', value: 66 },
        { label: 'Pagamento', value: 0 },
      ].map((e) => (
        <div key={e.label} className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{e.label}</span>
            <span>{e.value}%</span>
          </div>
          <Progress value={e.value} />
        </div>
      ))}
    </div>
  ),
};
