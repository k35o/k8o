'use client';

import { Code, Radio } from '@k8o/arte-odyssey';
import { useId, useState } from 'react';

type Theme = 'light' | 'dark' | 'sepia';

const themeOptions = [
  { value: 'light', label: 'light' },
  { value: 'dark', label: 'dark' },
  { value: 'sepia', label: 'sepia' },
] as const;

const isTheme = (value: string): value is Theme =>
  themeOptions.some((option) => option.value === value);

export function ContainerStyleQueriesDemo() {
  const [theme, setTheme] = useState<Theme>('light');
  const labelId = useId();

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        .csq-theme-root {
          container-name: csq-theme;
        }

        .csq-card {
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid currentColor;
          transition: background-color 200ms, color 200ms, border-color 200ms;
        }

        @container csq-theme style(--csq-theme: light) {
          .csq-card {
            background-color: #ffffff;
            color: #1f2937;
            border-color: #d1d5db;
          }
        }

        @container csq-theme style(--csq-theme: dark) {
          .csq-card {
            background-color: #0f172a;
            color: #f1f5f9;
            border-color: #334155;
          }
        }

        @container csq-theme style(--csq-theme: sepia) {
          .csq-card {
            background-color: #f4ecd8;
            color: #5b4636;
            border-color: #c9b48f;
          }
        }
      `}</style>

      <div className="flex flex-col gap-2">
        <p className="text-fg-mute text-sm">
          親の<Code>--csq-theme</Code>を切り替えると、子の
          <Code>.csq-card</Code>のスタイルが<Code>@container style()</Code>
          で追従します。途中のラッパーは<Code>--csq-theme: light</Code>
          に固定していますが、<Code>container-name</Code>
          で対象を親に固定しているので、深い子孫のカードも親の値で判定されます。
        </p>
        <p className="text-fg-base text-sm font-bold" id={labelId}>
          親の<Code>--csq-theme</Code>の値
        </p>
        <Radio
          aria-labelledby={labelId}
          name={`csq-theme-${labelId}`}
          onChange={(value) => {
            if (isTheme(value)) {
              setTheme(value);
            }
          }}
          options={themeOptions}
          value={theme}
        />
      </div>

      <div
        className="csq-theme-root flex flex-col gap-3 rounded-lg p-4"
        style={{ '--csq-theme': theme }}
      >
        <p className="text-fg-mute text-sm">
          親 (<Code>{`--csq-theme: ${theme}`}</Code>)
        </p>
        <div className="csq-card">
          <p className="font-bold">直近の子のカード</p>
          <p className="text-sm">親の値に応じて色が変わります。</p>
        </div>
        <div
          className="bg-bg-subtle rounded-md p-3"
          style={{ '--csq-theme': 'light' }}
        >
          <p className="text-fg-mute mb-2 text-sm">
            途中のラッパーは<Code>--csq-theme: light</Code>に固定
          </p>
          <div className="csq-card">
            <p className="font-bold">深い子孫のカード</p>
            <p className="text-sm">
              途中で上書きされていても、
              <code className="font-mono">container-name</code>
              で親に固定しているので親の値で判定されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
