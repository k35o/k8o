import type { Preview } from '@storybook/nextjs';
import { ComponentProvider } from '../src/providers';
import { cn } from '@k8o/helpers/cn';

import '../src/styles.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Toggle Color Theme.',
      defaultValue: 'light',
      toolbar: {
        title: 'Color Scheme',
        items: [
          { value: 'light', title: 'Light Mode', icon: 'sun' },
          { value: 'dark', title: 'Dark Mode', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    backgrounds: { disable: true },
    layout: 'fullscreen',
    mockingDate: new Date(2023, 0, 2, 12, 34, 56),
    nextjs: {
      appDirectory: true,
    },
    a11y: {
      test: 'error',
      options: {
        rules: {
          // コントラスト比がCIでFlakyな働きをするのでfalse
          // 色の設計の段階コントラストセーフなペアを選択しているのでそれを信頼する
          'color-contrast': { enabled: false },
        },
      },
    },
  },
  decorators: [
    (Story, { globals, parameters }) => {
      const theme = parameters.theme
        ? parameters.theme
        : globals.theme
          ? globals.theme
          : ('light' as 'light' | 'dark');
      return (
        <ComponentProvider>
          <div className={cn('min-h-svh p-6', theme)}>
            <Story />
          </div>
        </ComponentProvider>
      );
    },
  ],
};

export default preview;
