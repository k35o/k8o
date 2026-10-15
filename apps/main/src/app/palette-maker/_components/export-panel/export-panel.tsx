'use client';

import { CopyButton, Tabs } from '@k8ordo/ui';
import type { FC } from 'react';

import type { PaletteSwatch } from '../../_types/palette';
import {
  toCssVariablesCode,
  toTailwindThemeCode,
} from '../../_utils/export-code';

import styles from './export-panel.module.css';

type Props = {
  name: string;
  swatches: readonly PaletteSwatch[];
};

type PanelProps = {
  code: string;
  copyLabel: string;
};

const CodePanel: FC<PanelProps> = ({ code, copyLabel }) => (
  <div className={styles.codePanel}>
    <pre className={styles.pre}>
      <code className={styles.code}>{code}</code>
    </pre>
    <div>
      <CopyButton label={`${copyLabel}をコピー`} size="sm" value={code} />
    </div>
  </div>
);

export const ExportPanel: FC<Props> = ({ name, swatches }) => (
  <div className={styles.root}>
    <Tabs.Root defaultSelectedId="css" ids={['css', 'tailwind']}>
      <Tabs.List label="エクスポート形式">
        <Tabs.Tab id="css">CSS変数</Tabs.Tab>
        <Tabs.Tab id="tailwind">Tailwind @theme</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="css">
        <div className={styles.panel}>
          <CodePanel
            code={toCssVariablesCode(name, swatches)}
            copyLabel="CSS変数"
          />
        </div>
      </Tabs.Panel>
      <Tabs.Panel id="tailwind">
        <div className={styles.panel}>
          <CodePanel
            code={toTailwindThemeCode(name, swatches)}
            copyLabel="Tailwind @theme"
          />
        </div>
      </Tabs.Panel>
    </Tabs.Root>
    <div>
      <CopyButton
        label="共有用URLをコピー"
        size="sm"
        value={() => window.location.href}
      />
    </div>
  </div>
);
