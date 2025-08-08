import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Tabs } from './tabs';

const meta: Meta<typeof Tabs.Root> = {
  title: 'components/tabs',
  component: Tabs.Root,
};

export default meta;
type Story = StoryObj<typeof Tabs.Root>;

export const Primary: Story = {
  render: () => (
    <Tabs.Root ids={['tab1', 'tab2', 'tab3']}>
      <Tabs.List label="Tabs Example">
        <Tabs.Tab id="tab1">Tab1</Tabs.Tab>
        <Tabs.Tab id="tab2">Tab2</Tabs.Tab>
        <Tabs.Tab id="tab3">Tab3</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="tab1">Panel1</Tabs.Panel>
      <Tabs.Panel id="tab2">Panel2</Tabs.Panel>
      <Tabs.Panel id="tab3">Panel3</Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const tab2 = canvas.getByRole('tab', { name: 'Tab2' });
    const tab3 = canvas.getByRole('tab', { name: 'Tab3' });

    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Panel1');

    await userEvent.click(tab2);
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Panel2');

    await userEvent.click(tab3);
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Panel3');
  },
};

export const DefaultSelected: Story = {
  render: () => (
    <Tabs.Root defaultSelectedId="tab2" ids={['tab1', 'tab2', 'tab3']}>
      <Tabs.List label="Tabs Example">
        <Tabs.Tab id="tab1">Tab1</Tabs.Tab>
        <Tabs.Tab id="tab2">Tab2</Tabs.Tab>
        <Tabs.Tab id="tab3">Tab3</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="tab1">Panel1</Tabs.Panel>
      <Tabs.Panel id="tab2">Panel2</Tabs.Panel>
      <Tabs.Panel id="tab3">Panel3</Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Panel2');
  },
};
