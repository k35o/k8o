'use client';

import { Code, Radio } from '@k8ordo/ui';
import { useId, useState } from 'react';

import styles from './revert-rule-demo.module.css';

type RevertKeyword = 'revert-rule' | 'revert-layer' | 'revert';

const keywordOptions = [
  { value: 'revert-rule', label: 'revert-rule' },
  { value: 'revert-layer', label: 'revert-layer' },
  { value: 'revert', label: 'revert' },
] as const;

const isRevertKeyword = (value: string): value is RevertKeyword =>
  keywordOptions.some((option) => option.value === value);

const buildStyle = (keyword: RevertKeyword): string => `@layer rr-base {
  .rr-highlight {
    color: var(--color-fg-base);
    background-color: var(--color-bg-emphasize);
  }
}

@layer rr-components {
  .rr-highlight {
    color: var(--color-primary-fg);
    background-color: var(--color-primary-bg);
  }

  .rr-highlight.rr-quiet {
    color: ${keyword};
    background-color: ${keyword};
  }
}`;

export function RevertRuleDemo() {
  const [keyword, setKeyword] = useState<RevertKeyword>('revert-rule');
  const labelId = useId();
  const style = buildStyle(keyword);

  return (
    <div className={styles.root}>
      <style>{style}</style>

      <div className={styles.control}>
        <p className={styles.controlLabel} id={labelId}>
          <Code>.rr-quiet</Code>に書くキーワード
        </p>
        <Radio
          aria-labelledby={labelId}
          name={`revert-keyword-${labelId}`}
          onChange={(value) => {
            if (isRevertKeyword(value)) {
              setKeyword(value);
            }
          }}
          options={keywordOptions}
          value={keyword}
        />
      </div>

      <p className={styles.sample}>
        <mark className="rr-highlight">.rr-highlight</mark>と
        <mark className="rr-highlight rr-quiet">.rr-highlight.rr-quiet</mark>
      </p>

      <div className={styles.section}>
        <p className={styles.note}>要素に当てているCSSです。</p>
        <pre className={styles.code}>
          <code>{style}</code>
        </pre>
      </div>
    </div>
  );
}
