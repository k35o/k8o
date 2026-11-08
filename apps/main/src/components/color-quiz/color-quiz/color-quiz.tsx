'use client';

import { Tabs } from '@k8ordo/ui';

import { BrowserOnly } from '@/components/site/browser-only/browser-only';

import { ColorToHex } from './color-to-hex';
import { HexToColor } from './hex-to-color';

// 出題は Math.random() で決めるので、HTML と食い違わないようブラウザでだけ描く
export const ColorQuiz = () => (
  <Tabs.Root
    defaultSelectedId="color-to-hex"
    ids={['color-to-hex', 'hex-to-color']}
  >
    <Tabs.List label="クイズモード">
      <Tabs.Tab id="color-to-hex">色からHexを当てる</Tabs.Tab>
      <Tabs.Tab id="hex-to-color">Hexから色を当てる</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel id="color-to-hex">
      <BrowserOnly>
        <ColorToHex />
      </BrowserOnly>
    </Tabs.Panel>
    <Tabs.Panel id="hex-to-color">
      <BrowserOnly>
        <HexToColor />
      </BrowserOnly>
    </Tabs.Panel>
  </Tabs.Root>
);
