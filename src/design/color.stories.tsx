import type { Meta, StoryObj } from '@storybook/react';
import { FC, ReactNode } from 'react';

import { Heading } from '@/components/heading';
import { cn } from '@/utils/cn';

const Circle: FC<{ className: string }> = ({ className }) => (
  <div
    className={cn(
      'flex size-12 rounded-full border border-borderPrimary bg-textBody',
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
      Sample: <Circle className="bg-textBody" />,
      lightCode: '#030712',
      darkCode: '#f9fafb',
    },
    {
      name: 'Description',
      Sample: <Circle className="bg-textDescription" />,
      lightCode: '#374151',
      darkCode: '#9ca3af',
    },
    {
      name: 'Link',
      Sample: <Circle className="bg-textLink" />,
      lightCode: '#2563eb',
      darkCode: '#93c5fd',
    },
    {
      name: 'On Fill',
      Sample: <Circle className="bg-textOnFill" />,
      lightCode: '#374151',
      darkCode: '#f9fafb',
    },
    {
      name: 'Highlight',
      Sample: <Circle className="bg-textHighlight" />,
      lightCode: '#0f766e',
      darkCode: '#0d9488',
    },
    {
      name: 'Error',
      Sample: <Circle className="bg-textError" />,
      lightCode: '#dc2626',
      darkCode: '#dc2626',
    },
    {
      name: 'Success',
      Sample: <Circle className="bg-textSuccess" />,
      lightCode: '#15803d',
      darkCode: '#15803d',
    },
    {
      name: 'Warning',
      Sample: <Circle className="bg-textWarning" />,
      lightCode: '#a16207',
      darkCode: '#a16207',
    },
    {
      name: 'Info',
      Sample: <Circle className="bg-textInfo" />,
      lightCode: '#2563eb',
      darkCode: '#2563eb',
    },
  ],
  background: [
    {
      name: 'Base',
      Sample: <Circle className="bg-bgBase" />,
      lightCode: '#f9fafb',
      darkCode: '#111827',
    },
    {
      name: 'Primary',
      Sample: <Circle className="bg-bgPrimary" />,
      lightCode: '#cbd5e1',
      darkCode: '#1e293b',
    },
    {
      name: 'Secondary',
      Sample: <Circle className="bg-bgSecondary" />,
      lightCode: '#e2e8f0',
      darkCode: '#334155',
    },
    {
      name: 'Tertiary',
      Sample: <Circle className="bg-bgTertiary" />,
      lightCode: '#f8fafc',
      darkCode: '#475569',
    },
    {
      name: 'Code Block',
      Sample: <Circle className="bg-bgCodeBlock" />,
      lightCode: '#1e293b',
      darkCode: '#0f172a',
    },
    {
      name: 'Error',
      Sample: <Circle className="bg-bgError" />,
      lightCode: '#fee2e2',
      darkCode: '#fee2e2',
    },
    {
      name: 'Success',
      Sample: <Circle className="bg-bgSuccess" />,
      lightCode: '#dcfce7',
      darkCode: '#dcfce7',
    },
    {
      name: 'Warning',
      Sample: <Circle className="bg-bgWarning" />,
      lightCode: '#fef9c3',
      darkCode: '#fef9c3',
    },
    {
      name: 'Info',
      Sample: <Circle className="bg-bgInfo" />,
      lightCode: '#dbeafe',
      darkCode: '#dbeafe',
    },
    {
      name: 'Hover',
      Sample: <Circle className="bg-bgHover" />,
      lightCode: '#e5e7eb',
      darkCode: '#d1d5db',
    },
    {
      name: 'Active',
      Sample: <Circle className="bg-bgActive" />,
      lightCode: '#374151',
      darkCode: '#374151',
    },
    {
      name: 'Transparent',
      Sample: <Circle className="bg-bgTransparent" />,
      lightCode: 'transparent',
      darkCode: 'transparent',
    },
    {
      name: 'Back Drop',
      Sample: <Circle className="bg-bgBackDrop" />,
      lightCode: 'rgba(0, 0, 0, 0.5)',
      darkCode: 'rgba(0, 0, 0, 0.5)',
    },
  ],
  border: [
    {
      name: 'Primary',
      Sample: <Circle className="border-borderPrimary bg-bgBase" />,
      lightCode: '#4b5563',
      darkCode: '#6b7280',
    },
    {
      name: 'Secondary',
      Sample: <Circle className="border-borderSecondary bg-bgBase" />,
      lightCode: '#d1d5db',
      darkCode: '#4b5563',
    },
    {
      name: 'Focus',
      Sample: <Circle className="border-borderFocus bg-bgBase" />,
      lightCode: '#3b82f6',
      darkCode: '#3b82f6',
    },
    {
      name: 'Disabled',
      Sample: <Circle className="border-borderDisabled bg-bgBase" />,
      lightCode: '#d1d5db',
      darkCode: '#4b5563',
    },
    {
      name: 'Error',
      Sample: <Circle className="border-borderError bg-bgBase" />,
      lightCode: '#dc2626',
      darkCode: '#dc2626',
    },
    {
      name: 'Success',
      Sample: <Circle className="border-borderSuccess bg-bgBase" />,
      lightCode: '#15803d',
      darkCode: '#15803d',
    },
    {
      name: 'Warning',
      Sample: <Circle className="border-borderWarning bg-bgBase" />,
      lightCode: '#a16207',
      darkCode: '#a16207',
    },
    {
      name: 'Info',
      Sample: <Circle className="border-borderInfo bg-bgBase" />,
      lightCode: '#2563eb',
      darkCode: '#2563eb',
    },
    {
      name: 'Transparent',
      Sample: (
        <Circle className="border-borderTransparent bg-bgBase" />
      ),
      lightCode: 'transparent',
      darkCode: 'transparent',
    },
  ],
  button: [
    {
      name: 'Primary',
      Sample: <Circle className="bg-buttonPrimary" />,
      lightCode: '#0f766e',
      darkCode: '#14b8a6',
    },
    {
      name: 'Hover',
      Sample: <Circle className="bg-buttonHover" />,
      lightCode: '#115e59',
      darkCode: '#0d9488',
    },
    {
      name: 'Active',
      Sample: <Circle className="bg-buttonActive" />,
      lightCode: '#134e4a',
      darkCode: '#0f766e',
    },
  ],
  chart: [
    {
      name: 'Primary',
      Sample: <Circle className="bg-chartPrimary" />,
      lightCode: '#2dd4bf',
      darkCode: '#5eead4',
    },
    {
      name: 'Empty',
      Sample: <Circle className="bg-chartEmpty" />,
      lightCode: '#f3f4f6',
      darkCode: '#4b5563',
    },
  ],
  group: [
    {
      name: 'Primary',
      Sample: <Circle className="bg-groupPrimary" />,
      lightCode: '#2dd4bf',
      darkCode: '#5eead4',
    },
    {
      name: 'Secondary',
      Sample: <Circle className="bg-groupSecondary" />,
      lightCode: '#38bdf8',
      darkCode: '#7dd3fc',
    },
    {
      name: 'Tertiary',
      Sample: <Circle className="bg-groupTertiary" />,
      lightCode: '#818cf8',
      darkCode: '#a5b4fc',
    },
    {
      name: 'Quaternary',
      Sample: <Circle className="bg-groupQuaternary" />,
      lightCode: '#e879f9',
      darkCode: '#f0abfc',
    },
  ],
} as const satisfies Record<string, Color[]>;

const Component: FC<{ colors: Color[] }> = ({ colors }) => {
  return (
    <section className="flex">
      <div className="light flex flex-col justify-between gap-3 rounded-l-xl bg-bgBase p-3 text-textBody">
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
                <p className="text-sm text-textDescription">
                  {color.lightCode}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="dark flex flex-col justify-between gap-3 rounded-r-xl bg-bgBase p-3 text-textBody">
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
                <p className="text-sm text-textDescription">
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
