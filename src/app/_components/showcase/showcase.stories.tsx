import type { Meta, StoryObj } from '@storybook/react';
import { ShowCase } from './showcase';

const meta: Meta<typeof ShowCase.Container> = {
  title: 'app/globals/showcase',
  component: ShowCase.Container,
};

export default meta;
type Story = StoryObj<typeof ShowCase.Container>;

export const Primary: Story = {
  render: () => {
    return (
      <ShowCase.Container>
        <ShowCase.Item
          link="/characters"
          emotion="📄"
          title="Characters"
        />
        <ShowCase.Item link="/number" emotion="🔢" title="Number" />
        <ShowCase.Item link="/colors" emotion="🎨" title="Colors" />
        <ShowCase.Item link="/quizzes" emotion="💡" title="Quizzes" />
        <ShowCase.Item
          link="/engineerings"
          emotion="🧑‍💻"
          title="Engineerings"
        />
        <ShowCase.Item link="/blog" emotion="📕" title="Blog" />
      </ShowCase.Container>
    );
  },
};
