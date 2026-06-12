import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../components/ui/tooltip';
import { Button } from '../components/ui/button';
import { Info } from 'lucide-react';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Passe o mouse</Button>
      </TooltipTrigger>
      <TooltipContent>Quitação em tempo real, sem taxa adicional</TooltipContent>
    </Tooltip>
  ),
};

export const ComIcone: Story = {
  name: 'Ícone de ajuda',
  render: () => (
    <span className="flex items-center gap-1.5 text-sm">
      Free Flow
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="text-muted-foreground hover:text-[#5B2E8C]">
            <Info className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          Pórticos sem cancela que registram a passagem por câmera e geram débito posterior.
        </TooltipContent>
      </Tooltip>
    </span>
  ),
};
