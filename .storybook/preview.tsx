import '../src/index.css';
import React from 'react';
import type { Preview, Decorator } from '@storybook/react-vite';

/**
 * Decorator global: envolve cada story na fonte Inter e dá um respiro de padding.
 * Mantém a tipografia consistente com a aplicação real (tokens.ts › fontFamily.sans).
 */
const withAppShell: Decorator = (Story) => (
  <div
    style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    className="text-foreground antialiased"
  >
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withAppShell],
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Fundos disponíveis no toolbar — reflete a paleta institucional.
    backgrounds: {
      default: 'off-white',
      values: [
        { name: 'off-white', value: '#F7F5FB' },
        { name: 'branco', value: '#FFFFFF' },
        { name: 'violeta-900', value: '#2E1547' },
      ],
    },
    options: {
      storySort: {
        order: ['UI', 'Components', '*'],
      },
    },
  },
};

export default preview;
