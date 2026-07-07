'use client';

import {
  Button,
  CopyIcon,
  LinkIcon,
  Tabs,
  useClipboard,
  useToast,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

import type { PaletteSwatch } from '../../_types/palette';
import {
  toCssVariablesCode,
  toTailwindThemeCode,
} from '../../_utils/export-code';

type Props = {
  name: string;
  swatches: readonly PaletteSwatch[];
};

type PanelProps = {
  code: string;
  copyLabel: string;
};

const CodePanel: FC<PanelProps> = ({ code, copyLabel }) => {
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const handleCopy = async () => {
    try {
      await writeClipboard(code);
      onOpen('success', `${copyLabel}をコピーしました`);
    } catch {
      onOpen('error', 'コピーに失敗しました');
    }
  };

  return (
    <div className="bg-bg-subtle flex flex-col gap-3 rounded-xl px-4 py-3">
      <pre className="overflow-x-auto">
        <code className="text-fg-base font-mono text-sm">{code}</code>
      </pre>
      <div>
        <Button
          onClick={() => {
            void handleCopy();
          }}
          size="sm"
          startIcon={<CopyIcon size="sm" />}
          variant="outline"
        >
          {copyLabel}をコピー
        </Button>
      </div>
    </div>
  );
};

export const ExportPanel: FC<Props> = ({ name, swatches }) => {
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const handleCopyUrl = async () => {
    try {
      await writeClipboard(window.location.href);
      onOpen('success', '共有用URLをコピーしました');
    } catch {
      onOpen('error', 'コピーに失敗しました');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Tabs.Root defaultSelectedId="css" ids={['css', 'tailwind']}>
        <Tabs.List label="エクスポート形式">
          <Tabs.Tab id="css">CSS変数</Tabs.Tab>
          <Tabs.Tab id="tailwind">Tailwind @theme</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="css">
          <div className="pt-3">
            <CodePanel
              code={toCssVariablesCode(name, swatches)}
              copyLabel="CSS変数"
            />
          </div>
        </Tabs.Panel>
        <Tabs.Panel id="tailwind">
          <div className="pt-3">
            <CodePanel
              code={toTailwindThemeCode(name, swatches)}
              copyLabel="Tailwind @theme"
            />
          </div>
        </Tabs.Panel>
      </Tabs.Root>
      <div>
        <Button
          onClick={() => {
            void handleCopyUrl();
          }}
          size="sm"
          startIcon={<LinkIcon size="sm" />}
          variant="outline"
        >
          共有用URLをコピー
        </Button>
      </div>
    </div>
  );
};
