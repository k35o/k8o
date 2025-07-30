import { DarkModeIcon } from '../icons';
import { DropdownMenu } from './dropdown-menu';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

const meta: Meta<typeof DropdownMenu.Root> = {
  title: 'components/dropdown-menu',
  component: DropdownMenu.Root,
  parameters: {
    a11y: {
      options: {
        rules: {
          // https://github.com/floating-ui/floating-ui/pull/2298#issuecomment-1518101512
          'aria-hidden-focus': { enabled: false },
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu.Root>;

export const Default: Story = {
  render: () => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger text="Options" />
      <DropdownMenu.Content>
        <DropdownMenu.Item
          label="Item 1"
          onClick={() => {
            console.log(1);
          }}
        />
        <DropdownMenu.Item
          label="Item 2"
          onClick={() => {
            console.log(2);
          }}
        />
        <DropdownMenu.Item
          label="Item 3"
          onClick={() => {
            console.log(3);
          }}
        />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Options',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
  },
};

export const TriggerByIcon: Story = {
  render: () => (
    <DropdownMenu.Root>
      <DropdownMenu.IconTrigger
        icon={<DarkModeIcon size="lg" />}
        label="Options"
      />
      <DropdownMenu.Content>
        <DropdownMenu.Item
          label="Item 1"
          onClick={() => {
            console.log(1);
          }}
        />
        <DropdownMenu.Item
          label="Item 2"
          onClick={() => {
            console.log(2);
          }}
        />
        <DropdownMenu.Item
          label="Item 3"
          onClick={() => {
            console.log(3);
          }}
        />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Options',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
  },
};
