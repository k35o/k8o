import { Playground } from './playground';
import { Button } from '@/components/button';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { FC, useState } from 'react';

const meta: Meta<typeof Playground> = {
  title: 'playgrounds/Playground',
  component: Playground,
};

export default meta;
type Story = StoryObj<typeof Playground>;

const Counter: FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p>{count}</p>
      <Button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        Increment
      </Button>
    </div>
  );
};

export const Primary: Story = {
  args: {
    title: 'Counterのサンプル',
    children: <Counter />,
  },
};
