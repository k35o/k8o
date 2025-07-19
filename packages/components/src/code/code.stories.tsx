import { Code } from './code';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Components/Code',
  component: Code,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'const example = "Hello World";',
  },
};

export const HSLColor: Story = {
  args: {
    children: 'hsl(280, 70%, 50%)',
  },
};

export const RGBColor: Story = {
  args: {
    children: 'rgb(255, 0, 128)',
  },
};

export const HexColor: Story = {
  args: {
    children: '#ff0080',
  },
};

export const NamedColor: Story = {
  args: {
    children: 'background-color: red',
  },
};

export const ComplexCSS: Story = {
  args: {
    children:
      'background-color: hsl(calc(sign(var(--x)) * 80 + 200), 70%, 50%)',
  },
};

export const MultipleColors: Story = {
  args: {
    children:
      'border: 1px solid #ff0080; background: hsl(280, 70%, 50%); color: rgb(255, 255, 255);',
  },
};

export const GradientWithMultipleColors: Story = {
  args: {
    children:
      'background: linear-gradient(45deg, #ff0080, hsl(280, 70%, 50%), rgba(255, 0, 128, 0.5))',
  },
};
