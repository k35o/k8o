'use client';

import { Color } from './_components/color';
import { Components } from './_components/components';
import { Radius } from './_components/radius';
import { Spacing } from './_components/spacing';
import { Typography } from './_components/typography';
import { Tabs } from '@/components/tabs';

export default function Page() {
  return (
    <section className="bg-bg-base grid h-full gap-6 rounded-md p-4">
      <Tabs.Root
        ids={[
          'color',
          'radius',
          'spacing',
          'typography',
          'components',
        ]}
        hashLink
      >
        <Tabs.List label="Design System">
          <Tabs.Tab id="color">
            <p className="text-xl font-bold">Color</p>
          </Tabs.Tab>
          <Tabs.Tab id="radius">
            <p className="text-xl font-bold">Radius</p>
          </Tabs.Tab>
          <Tabs.Tab id="typography">
            <p className="text-xl font-bold">Typography</p>
          </Tabs.Tab>
          <Tabs.Tab id="spacing">
            <p className="text-xl font-bold">Spacing</p>
          </Tabs.Tab>
          <Tabs.Tab id="components">
            <p className="text-xl font-bold">Components</p>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="color">
          <Color />
        </Tabs.Panel>
        <Tabs.Panel id="radius">
          <Radius />
        </Tabs.Panel>
        <Tabs.Panel id="typography">
          <Typography />
        </Tabs.Panel>
        <Tabs.Panel id="spacing">
          <Spacing />
        </Tabs.Panel>
        <Tabs.Panel id="components">
          <Components />
        </Tabs.Panel>
      </Tabs.Root>
    </section>
  );
}
