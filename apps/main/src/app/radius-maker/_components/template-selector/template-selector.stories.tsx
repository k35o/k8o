import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { TemplateSelector } from './template-selector';

const meta: Meta<typeof TemplateSelector> = {
  title: 'app/radius-maker/template-selector',
  component: TemplateSelector,
};

export default meta;

type Story = StoryObj<typeof TemplateSelector>;

const defaultPosition = {
  topLeftX: 0,
  topLeftY: 0,
  topRightX: 0,
  topRightY: 0,
  bottomLeftX: 0,
  bottomLeftY: 0,
  bottomRightX: 0,
  bottomRightY: 0,
};

export const Default: Story = {
  args: {
    onSelect: fn(),
    currentPosition: defaultPosition,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // テンプレートラベルが表示されている
    await expect(canvas.getByText('テンプレート')).toBeInTheDocument();

    // すべてのテンプレートボタンが存在する
    await expect(
      canvas.getByRole('button', { name: '正方形' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '角丸' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '円形' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '楕円（横）' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '楕円（縦）' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'カプセル（上）' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'カプセル（左）' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '有機的' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'しずく' }),
    ).toBeInTheDocument();

    // 正方形が選択状態
    const squareButton = canvas.getByRole('button', { name: '正方形' });
    await expect(squareButton).toHaveAttribute('aria-pressed', 'true');
  },
};

export const CircleSelected: Story = {
  args: {
    onSelect: fn(),
    currentPosition: {
      topLeftX: 50,
      topLeftY: 50,
      topRightX: 50,
      topRightY: 50,
      bottomLeftX: 50,
      bottomLeftY: 50,
      bottomRightX: 50,
      bottomRightY: 50,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 円形が選択状態
    const circleButton = canvas.getByRole('button', { name: '円形' });
    await expect(circleButton).toHaveAttribute('aria-pressed', 'true');

    // 正方形は非選択
    const squareButton = canvas.getByRole('button', { name: '正方形' });
    await expect(squareButton).toHaveAttribute('aria-pressed', 'false');
  },
};

export const OrganicSelected: Story = {
  args: {
    onSelect: fn(),
    currentPosition: {
      topLeftX: 63,
      topLeftY: 37,
      topRightX: 24,
      topRightY: 54,
      bottomLeftX: 53,
      bottomLeftY: 26,
      bottomRightX: 32,
      bottomRightY: 36,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 有機的が選択状態
    const organicButton = canvas.getByRole('button', { name: '有機的' });
    await expect(organicButton).toHaveAttribute('aria-pressed', 'true');
  },
};

export const NoMatchingTemplate: Story = {
  args: {
    onSelect: fn(),
    currentPosition: {
      topLeftX: 10,
      topLeftY: 15,
      topRightX: 20,
      topRightY: 25,
      bottomLeftX: 30,
      bottomLeftY: 35,
      bottomRightX: 40,
      bottomRightY: 45,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // どのテンプレートも選択されていない
    const buttons = canvas.getAllByRole('button');
    await Promise.all(
      buttons.map((button) =>
        expect(button).toHaveAttribute('aria-pressed', 'false'),
      ),
    );
  },
};
