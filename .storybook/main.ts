import { mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',

  /**
   * Força o plugin @tailwindcss/vite no pipeline Vite do Storybook.
   * Sem isso, o Storybook não compila as classes utilitárias do Tailwind v4
   * e os componentes ficam sem estilo.
   */
  viteFinal: async (config) =>
    mergeConfig(config, {
      plugins: [tailwindcss()],
    }),
};

export default config;
