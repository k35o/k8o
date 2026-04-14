'use client';

import { Tabs } from '@k8o/arte-odyssey';
import { useEffect, useState } from 'react';
import { ColorToHex } from './color-to-hex';
import { HexToColor } from './hex-to-color';

export const ColorQuiz = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Tabs.Root
      defaultSelectedId="color-to-hex"
      ids={['color-to-hex', 'hex-to-color']}
    >
      <Tabs.List label="クイズモード">
        <Tabs.Tab id="color-to-hex">色からHexを当てる</Tabs.Tab>
        <Tabs.Tab id="hex-to-color">Hexから色を当てる</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="color-to-hex">{isMounted && <ColorToHex />}</Tabs.Panel>
      <Tabs.Panel id="hex-to-color">{isMounted && <HexToColor />}</Tabs.Panel>
    </Tabs.Root>
  );
};
