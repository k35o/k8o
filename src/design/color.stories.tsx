import type { Meta, StoryObj } from '@storybook/react';
import { FC, ReactNode } from 'react';

import { Heading } from '@/components/heading';
import { cn } from '@/utils/cn';

const Circle: FC<{ className: string }> = ({ className }) => (
  <div
    className={cn(
      'border-border-primary bg-text-body flex size-12 rounded-full border',
      className,
    )}
  />
);

type Color = {
  name: string;
  Sample: ReactNode;
  lightCode: string;
  darkCode: string;
};

const COLORS = {
  foreground: [
    {
      name: 'Body',
      Sample: <Circle className="bg-text-body" />,
      lightCode: '#030712',
      darkCode: '#f9fafb',
    },
    {
      name: 'Description',
      Sample: <Circle className="bg-text-description" />,
      lightCode: '#374151',
      darkCode: '#9ca3af',
    },
    {
      name: 'Link',
      Sample: <Circle className="bg-text-link" />,
      lightCode: '#2563eb',
      darkCode: '#93c5fd',
    },
    {
      name: 'On Fill',
      Sample: <Circle className="bg-text-on-fill" />,
      lightCode: '#374151',
      darkCode: '#f9fafb',
    },
    {
      name: 'Highlight',
      Sample: <Circle className="bg-text-highlight" />,
      lightCode: '#0f766e',
      darkCode: '#0d9488',
    },
    {
      name: 'Error',
      Sample: <Circle className="bg-text-error" />,
      lightCode: '#dc2626',
      darkCode: '#dc2626',
    },
    {
      name: 'Success',
      Sample: <Circle className="bg-text-success" />,
      lightCode: '#15803d',
      darkCode: '#15803d',
    },
    {
      name: 'Warning',
      Sample: <Circle className="bg-text-warning" />,
      lightCode: '#a16207',
      darkCode: '#a16207',
    },
    {
      name: 'Info',
      Sample: <Circle className="bg-text-info" />,
      lightCode: '#2563eb',
      darkCode: '#2563eb',
    },
    {
      name: 'Disabled',
      Sample: <Circle className="bg-text-disabled" />,
      lightCode: '#374151',
      darkCode: '#9ca3af',
    },
  ],
  background: [
    {
      name: 'Base',
      Sample: <Circle className="bg-bg-base" />,
      lightCode: '#f9fafb',
      darkCode: '#111827',
    },
    {
      name: 'Primary',
      Sample: <Circle className="bg-bg-primary" />,
      lightCode: '#cbd5e1',
      darkCode: '#1e293b',
    },
    {
      name: 'Secondary',
      Sample: <Circle className="bg-bg-secondary" />,
      lightCode: '#e2e8f0',
      darkCode: '#334155',
    },
    {
      name: 'Tertiary',
      Sample: <Circle className="bg-bg-tertiary" />,
      lightCode: '#f8fafc',
      darkCode: '#475569',
    },
    {
      name: 'Highlight',
      Sample: <Circle className="bg-bg-highlight" />,
      lightCode: '#2dd4bf',
      darkCode: '#5eead4',
    },
    {
      name: 'Code Block',
      Sample: <Circle className="bg-bg-code-block" />,
      lightCode: '#1e293b',
      darkCode: '#0f172a',
    },
    {
      name: 'Error',
      Sample: <Circle className="bg-bg-error" />,
      lightCode: '#fee2e2',
      darkCode: '#fee2e2',
    },
    {
      name: 'Success',
      Sample: <Circle className="bg-bg-success" />,
      lightCode: '#dcfce7',
      darkCode: '#dcfce7',
    },
    {
      name: 'Warning',
      Sample: <Circle className="bg-bg-warning" />,
      lightCode: '#fef9c3',
      darkCode: '#fef9c3',
    },
    {
      name: 'Info',
      Sample: <Circle className="bg-bg-info" />,
      lightCode: '#dbeafe',
      darkCode: '#dbeafe',
    },
    {
      name: 'Hover',
      Sample: <Circle className="bg-bg-hover" />,
      lightCode: '#e5e7eb',
      darkCode: '#d1d5db',
    },
    {
      name: 'Active',
      Sample: <Circle className="bg-bg-active" />,
      lightCode: '#374151',
      darkCode: '#374151',
    },
    {
      name: 'Disabled',
      Sample: <Circle className="bg-bg-disabled" />,
      lightCode: '#e2e8f0',
      darkCode: '#334155',
    },
    {
      name: 'Transparent',
      Sample: <Circle className="bg-bg-transparent" />,
      lightCode: 'transparent',
      darkCode: 'transparent',
    },
    {
      name: 'Back Drop',
      Sample: <Circle className="bg-bg-back-drop" />,
      lightCode: 'rgba(0, 0, 0, 0.5)',
      darkCode: 'rgba(0, 0, 0, 0.5)',
    },
  ],
  border: [
    {
      name: 'Primary',
      Sample: <Circle className="border-border-primary bg-bg-base" />,
      lightCode: '#4b5563',
      darkCode: '#6b7280',
    },
    {
      name: 'Secondary',
      Sample: (
        <Circle className="border-border-secondary bg-bg-base" />
      ),
      lightCode: '#d1d5db',
      darkCode: '#4b5563',
    },
    {
      name: 'Error',
      Sample: <Circle className="border-border-error bg-bg-base" />,
      lightCode: '#dc2626',
      darkCode: '#dc2626',
    },
    {
      name: 'Success',
      Sample: <Circle className="border-border-success bg-bg-base" />,
      lightCode: '#15803d',
      darkCode: '#15803d',
    },
    {
      name: 'Warning',
      Sample: <Circle className="border-border-warning bg-bg-base" />,
      lightCode: '#a16207',
      darkCode: '#a16207',
    },
    {
      name: 'Info',
      Sample: <Circle className="border-border-info bg-bg-base" />,
      lightCode: '#2563eb',
      darkCode: '#2563eb',
    },
    {
      name: 'Focus',
      Sample: <Circle className="border-border-focus bg-bg-base" />,
      lightCode: '#3b82f6',
      darkCode: '#3b82f6',
    },
    {
      name: 'Disabled',
      Sample: (
        <Circle className="border-border-disabled bg-bg-base" />
      ),
      lightCode: '#d1d5db',
      darkCode: '#4b5563',
    },
    {
      name: 'Transparent',
      Sample: (
        <Circle className="border-border-transparent bg-bg-base" />
      ),
      lightCode: 'transparent',
      darkCode: 'transparent',
    },
  ],
  button: [
    {
      name: 'Primary',
      Sample: <Circle className="bg-button-primary" />,
      lightCode: '#0f766e',
      darkCode: '#14b8a6',
    },
    {
      name: 'Hover',
      Sample: <Circle className="bg-button-hover" />,
      lightCode: '#115e59',
      darkCode: '#0d9488',
    },
    {
      name: 'Active',
      Sample: <Circle className="bg-button-active" />,
      lightCode: '#134e4a',
      darkCode: '#0f766e',
    },
  ],
  chart: [
    {
      name: 'Primary',
      Sample: <Circle className="bg-chart-primary" />,
      lightCode: '#2dd4bf',
      darkCode: '#5eead4',
    },
    {
      name: 'Empty',
      Sample: <Circle className="bg-chart-empty" />,
      lightCode: '#f3f4f6',
      darkCode: '#4b5563',
    },
  ],
  group: [
    {
      name: 'Primary',
      Sample: <Circle className="bg-group-primary" />,
      lightCode: '#2dd4bf',
      darkCode: '#5eead4',
    },
    {
      name: 'Secondary',
      Sample: <Circle className="bg-group-secondary" />,
      lightCode: '#38bdf8',
      darkCode: '#7dd3fc',
    },
    {
      name: 'Tertiary',
      Sample: <Circle className="bg-group-tertiary" />,
      lightCode: '#818cf8',
      darkCode: '#a5b4fc',
    },
    {
      name: 'Quaternary',
      Sample: <Circle className="bg-group-quaternary" />,
      lightCode: '#e879f9',
      darkCode: '#f0abfc',
    },
  ],
} as const satisfies Record<string, Color[]>;

const Component: FC<{ colors: Color[] }> = ({ colors }) => {
  return (
    <section className="flex">
      <div className="light bg-bg-base text-text-body flex flex-col justify-between gap-3 rounded-l-xl p-3">
        <Heading type="h2">Light Theme</Heading>
        <div className="flex flex-col gap-3">
          {colors.map((color) => (
            <div
              key={color.name}
              className="flex w-full items-center gap-2"
            >
              {color.Sample}
              <div className="flex flex-col">
                <p>{color.name}</p>
                <p className="text-text-description text-sm">
                  {color.lightCode}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="dark bg-bg-base text-text-body flex flex-col justify-between gap-3 rounded-r-xl p-3">
        <Heading type="h2">Dark Theme</Heading>
        <div className="flex flex-col gap-3">
          {colors.map((color) => (
            <div
              key={color.name}
              className="flex w-full items-center gap-2"
            >
              {color.Sample}
              <div className="flex flex-col">
                <p>{color.name}</p>
                <p className="text-text-description text-sm">
                  {color.darkCode}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const meta: Meta<typeof Component> = {
  title: 'design/color',
  component: Component,
  parameters: {
    theme: 'light',
  },
};

export default meta;

export const Foreground: StoryObj<typeof Component> = {
  render: () => <Component colors={COLORS.foreground} />,
};

export const Background: StoryObj<typeof Component> = {
  render: () => <Component colors={COLORS.background} />,
};

export const Border: StoryObj<typeof Component> = {
  render: () => <Component colors={COLORS.border} />,
};

export const Button: StoryObj<typeof Component> = {
  render: () => <Component colors={COLORS.button} />,
};

export const Chart: StoryObj<typeof Component> = {
  render: () => <Component colors={COLORS.chart} />,
};

export const Group: StoryObj<typeof Component> = {
  render: () => <Component colors={COLORS.group} />,
};
