'use client';

import { Button, Checkbox } from '@k8ordo/ui';
import { useState } from 'react';
import { flushSync } from 'react-dom';

import styles from './view-transition-pseudo-demo.module.css';

const NAME = 'pseudo-box';
const TYPE = 'pseudo-elements';
// ページのほかの遷移にスタイルが当たらないよう、このデモの遷移の種類に絞る
const SCOPE = `:root:active-view-transition-type(${TYPE})`;

export function ViewTransitionPseudoDemo() {
  const [isLarge, setIsLarge] = useState(false);
  const [showsGroup, setShowsGroup] = useState(false);
  const [hidesOld, setHidesOld] = useState(false);
  const [hidesNew, setHidesNew] = useState(false);

  const rules = [
    `${SCOPE}::view-transition-group(${NAME}) { animation-duration: 1s; }`,
    showsGroup &&
      `${SCOPE}::view-transition-group(${NAME}) { outline: 2px dashed var(--color-fg-base); }`,
    hidesOld &&
      `${SCOPE}::view-transition-old(${NAME}) { animation: none; opacity: 0; }`,
    hidesNew &&
      `${SCOPE}::view-transition-new(${NAME}) { animation: none; opacity: 0; }`,
  ].filter(Boolean);

  const toggle = () => {
    document.startViewTransition({
      update: () => {
        flushSync(() => {
          setIsLarge((prev) => !prev);
        });
      },
      types: [TYPE],
    });
  };

  return (
    <div className={styles.root}>
      <style>{rules.join('\n')}</style>
      <div className={styles.options}>
        <Checkbox
          checked={showsGroup}
          label="::view-transition-group() に点線の枠を付ける"
          onChange={setShowsGroup}
        />
        <Checkbox
          checked={hidesOld}
          label="::view-transition-old() を隠す"
          onChange={setHidesOld}
        />
        <Checkbox
          checked={hidesNew}
          label="::view-transition-new() を隠す"
          onChange={setHidesNew}
        />
      </div>
      <Button onClick={toggle}>{isLarge ? '小さくする' : '大きくする'}</Button>
      <div className={styles.stage} data-large={isLarge}>
        <div
          className={styles.box}
          data-large={isLarge}
          style={{ viewTransitionName: NAME }}
        />
      </div>
    </div>
  );
}
