import { Breadcrumb } from './breadcrumb';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Breadcrumb.List> = {
  title: 'components/breadcrumb',
  component: Breadcrumb.List,
};

export default meta;
type Story = StoryObj<typeof Breadcrumb.List>;

export const Medium: Story = {
  render: () => (
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/quizzes">Quizzes</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/quizzes/fish-kanji" current>
          うおへんクイズ
        </Breadcrumb.Link>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  ),
};

export const Large: Story = {
  render: () => (
    <Breadcrumb.List size="lg">
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/quizzes">Quizzes</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/quizzes/fish-kanji" current>
          うおへんクイズ
        </Breadcrumb.Link>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  ),
};

export const Small: Story = {
  render: () => (
    <Breadcrumb.List size="sm">
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/quizzes">Quizzes</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/quizzes/fish-kanji" current>
          うおへんクイズ
        </Breadcrumb.Link>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  ),
};
