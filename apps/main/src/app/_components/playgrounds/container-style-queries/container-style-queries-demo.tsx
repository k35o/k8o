'use client';

import { Code, Radio } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useId, useState } from 'react';

import styles from './container-style-queries-demo.module.css';

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
    <div className={styles.root}>
      <style>{`
        .csq-theme-root {
          container-name: csq-theme;
        }

        .csq-card {
          padding: 1rem;
          border-radius: 0.5rem;
          transition: background-color 200ms, color 200ms;
        }

        @container csq-theme style(--csq-theme: light) {
          .csq-card {
            background-color: #ffffff;
            color: #1f2937;
          }
        }

        @container csq-theme style(--csq-theme: dark) {
          .csq-card {
            background-color: #0f172a;
            color: #f1f5f9;
          }
        }

        @container csq-theme style(--csq-theme: sepia) {
          .csq-card {
            background-color: #f4ecd8;
            color: #5b4636;
          }
        }
      `}</style>

      <div className={styles.control}>
        <p className={styles.note}>
          親の<Code>--csq-theme</Code>を切り替えると、子の
          <Code>.csq-card</Code>のスタイルが<Code>@container style()</Code>
          で追従します。途中のラッパーは<Code>--csq-theme: light</Code>
          に固定していますが、<Code>container-name</Code>
          で対象を親に固定しているので、深い子孫のカードも親の値で判定されます。
        </p>
        <p className={styles.controlLabel} id={labelId}>
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
        className={cn('csq-theme-root', styles.parent)}
        style={{ '--csq-theme': theme }}
      >
        <p className={styles.note}>
          親 (<Code>{`--csq-theme: ${theme}`}</Code>)
        </p>
        <div className="csq-card">
          <p className={styles.cardTitle}>直近の子のカード</p>
          <p className={styles.cardText}>親の値に応じて色が変わります。</p>
        </div>
        <div className={styles.wrapper} style={{ '--csq-theme': 'light' }}>
          <p className={styles.wrapperNote}>
            途中のラッパーは<Code>--csq-theme: light</Code>に固定
          </p>
          <div className="csq-card">
            <p className={styles.cardTitle}>深い子孫のカード</p>
            <p className={styles.cardText}>
              途中で上書きされていても、
              <code className={styles.code}>container-name</code>
              で親に固定しているので親の値で判定されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
