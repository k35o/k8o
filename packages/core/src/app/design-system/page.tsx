'use client';

import { Tabs } from '@k8o/arte-odyssey/tabs';
import { Color } from './_components/color';
import { Components } from './_components/components';
import { Radius } from './_components/radius';
import { Spacing } from './_components/spacing';
import { Typography } from './_components/typography';

export default function Page() {
  return (
    <section className="grid h-full gap-6 rounded-md bg-bg-base p-4">
      <Tabs.Root
        ids={['color', 'radius', 'spacing', 'typography', 'components']}
      >
        <Tabs.List label="Design System">
          <Tabs.Tab id="color">
            <p className="font-bold text-lg md:text-xl">Color</p>
          </Tabs.Tab>
          <Tabs.Tab id="radius">
            <p className="font-bold text-lg md:text-xl">Radius</p>
          </Tabs.Tab>
          <Tabs.Tab id="typography">
            <p className="font-bold text-lg md:text-xl">Typography</p>
          </Tabs.Tab>
          <Tabs.Tab id="spacing">
            <p className="font-bold text-lg md:text-xl">Spacing</p>
          </Tabs.Tab>
          <Tabs.Tab id="components">
            <p className="font-bold text-lg md:text-xl">Components</p>
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
