'use client';

import { Code, Radio } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useId, useState } from 'react';

import styles from './container-style-queries-demo.module.css';

type Theme = 'light' | 'dark';
type Override = 'none' | Theme;

const themeOptions = [
  { value: 'light', label: 'light' },
  { value: 'dark', label: 'dark' },
] as const;

const overrideOptions = [
  { value: 'none', label: '上書きしない' },
  { value: 'light', label: 'light' },
  { value: 'dark', label: 'dark' },
] as const;

const isTheme = (value: string): value is Theme =>
  themeOptions.some((option) => option.value === value);

const isOverride = (value: string): value is Override =>
  overrideOptions.some((option) => option.value === value);

const STYLE = `.csq-root {
  container-name: csq-theme;
}

.csq-card {
  background-color: #ffffff;
  color: #1f2937;
}

.csq-result::after {
  content: 'light';
}

@container csq-theme style(--csq-theme: dark) {
  .csq-card[data-query='named'] {
    background-color: #0f172a;
    color: #f1f5f9;
  }

  .csq-card[data-query='named'] .csq-result::after {
    content: 'dark';
  }
}

@container style(--csq-theme: dark) {
  .csq-card[data-query='unnamed'] {
    background-color: #0f172a;
    color: #f1f5f9;
  }

  .csq-card[data-query='unnamed'] .csq-result::after {
    content: 'dark';
  }
}`;

export function ContainerStyleQueriesDemo() {
  const [parent, setParent] = useState<Theme>('dark');
  const [override, setOverride] = useState<Override>('light');
  const parentLabelId = useId();
  const overrideLabelId = useId();

  return (
    <div className={styles.root}>
      <style>{STYLE}</style>

      <div className={styles.controls}>
        <div className={styles.control}>
          <p className={styles.controlLabel} id={parentLabelId}>
            親の<Code>--csq-theme</Code>
          </p>
          <Radio
            aria-labelledby={parentLabelId}
            name={`csq-parent-${parentLabelId}`}
            onChange={(value) => {
              if (isTheme(value)) {
                setParent(value);
              }
            }}
            options={themeOptions}
            value={parent}
          />
        </div>
        <div className={styles.control}>
          <p className={styles.controlLabel} id={overrideLabelId}>
            途中の要素の<Code>--csq-theme</Code>
          </p>
          <Radio
            aria-labelledby={overrideLabelId}
            name={`csq-override-${overrideLabelId}`}
            onChange={(value) => {
              if (isOverride(value)) {
                setOverride(value);
              }
            }}
            options={overrideOptions}
            value={override}
          />
        </div>
      </div>

      <div
        className={cn('csq-root', styles.parent)}
        style={{ '--csq-theme': parent }}
      >
        <p className={styles.boxLabel}>
          親（<Code>container-name: csq-theme</Code>）
        </p>
        <div
          className={styles.wrapper}
          style={override === 'none' ? undefined : { '--csq-theme': override }}
        >
          <p className={styles.boxLabel}>
            途中の要素
            {override === 'none'
              ? '（上書きしない）'
              : `（${override}で上書き）`}
          </p>
          <div className={styles.cards}>
            <div className={cn('csq-card', styles.card)} data-query="named">
              <p className={styles.cardTitle}>名前を付けたクエリ</p>
              <p className={styles.cardQuery}>
                <code>@container csq-theme style(--csq-theme: dark)</code>
              </p>
              <p className={styles.cardResult}>
                見ている値：
                <span className="csq-result" />
              </p>
            </div>
            <div className={cn('csq-card', styles.card)} data-query="unnamed">
              <p className={styles.cardTitle}>名前を付けないクエリ</p>
              <p className={styles.cardQuery}>
                <code>@container style(--csq-theme: dark)</code>
              </p>
              <p className={styles.cardResult}>
                見ている値：
                <span className="csq-result" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
