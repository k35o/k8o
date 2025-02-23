import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './tabs';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { getRouter } from '@storybook/nextjs/navigation.mock';
import { Alert } from '../alert';

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Panel1',
    );

    await userEvent.keyboard('{arrowright}');
    await waitFor(() =>
      expect(canvas.getByRole('tabpanel')).toHaveTextContent(
        'Panel2',
      ),
    );

    await userEvent.keyboard('{Arrowleft}');
    await waitFor(() =>
      expect(canvas.getByRole('tabpanel')).toHaveTextContent(
        'Panel1',
      ),
    );
  },
};

export const DefaultSelected: Story = {
  render: () => (
    <Tabs.Root
      ids={['tab1', 'tab2', 'tab3']}
      defaultSelectedId="tab2"
    >
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
};

export const HashLink: Story = {
  beforeEach() {
    getRouter().push.mockImplementation((hash: string) => {
      window.location.hash = hash;
    });
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Alert
        status="warning"
        message="Storybook上でクリックを使ってタブを切り替えた場合は別のWindowに遷移します"
      />
      <Tabs.Root
        ids={['tab1', 'tab2', 'tab3']}
        defaultSelectedId="tab2"
        hashLink
      >
        <Tabs.List label="Tabs Example">
          <Tabs.Tab id="tab1">Tab1</Tabs.Tab>
          <Tabs.Tab id="tab2">Tab2</Tabs.Tab>
          <Tabs.Tab id="tab3">Tab3</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="tab1">Panel1</Tabs.Panel>
        <Tabs.Panel id="tab2">Panel2</Tabs.Panel>
        <Tabs.Panel id="tab3">Panel3</Tabs.Panel>
      </Tabs.Root>
    </div>
  ),
};
