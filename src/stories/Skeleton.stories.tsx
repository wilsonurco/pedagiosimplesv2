import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '../components/ui/skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};

export const CardCarregando: Story = {
  name: 'Card carregando',
  render: () => (
    <div className="w-80 space-y-3 rounded-xl border border-[#ECECF1] p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  ),
};

export const ListaCarregando: Story = {
  name: 'Lista carregando',
  render: () => (
    <div className="w-80 space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border border-[#ECECF1] p-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="h-5 w-14" />
        </div>
      ))}
    </div>
  ),
};
