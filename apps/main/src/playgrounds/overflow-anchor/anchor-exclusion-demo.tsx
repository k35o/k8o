'use client';

import { Button, Code, Switch } from '@k8ordo/ui';
import { range } from '@repo/helpers/array/range';
import { useEffect, useRef, useState } from 'react';

import styles from './anchor-exclusion-demo.module.css';

const ITEM_COUNT = 10;
const SKELETON_INDEX = 4;
const SKELETON_HEIGHT = 96;
const LOADED_HEIGHT = 192;
// スケルトンが表示領域の上端をまたぐ位置。これでスケルトンが最初に見える要素になり、
// アンカーノードの候補の先頭に来る
const SKELETON_OFFSET = 12;

const scrollToSkeleton = (
  container: HTMLElement,
  skeleton: HTMLElement,
): void => {
  container.scrollTop = skeleton.offsetTop + SKELETON_OFFSET;
};

export function AnchorExclusionDemo() {
  const [excluded, setExcluded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const skeletonRef = useRef<HTMLDivElement>(null);

  // 最初にスケルトンが上端をまたぐ位置までスクロールしておく
  useEffect(() => {
    const container = containerRef.current;
    const skeleton = skeletonRef.current;
    if (container === null || skeleton === null) return;
    scrollToSkeleton(container, skeleton);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <Switch
          checked={excluded}
          label="スケルトンに overflow-anchor: none を付ける"
          onChange={setExcluded}
        />
        <Button
          color={loaded ? 'base' : 'primary'}
          onClick={() => {
            // 位置合わせは高さのトランジションが終わってから onTransitionEnd で行う
            setLoaded(!loaded);
          }}
          variant={loaded ? 'outline' : 'solid'}
        >
          {loaded ? 'スケルトンと位置を戻す' : '読み込みを完了させる'}
        </Button>
      </div>

      <section
        aria-label="アンカーノードの除外を確認するスクロール領域"
        className={styles.scroller}
        ref={containerRef}
        style={{
          scrollbarColor: 'var(--color-fg-subtle) var(--color-bg-subtle)',
        }}
        tabIndex={0}
      >
        <div className={styles.list}>
          {range(0, ITEM_COUNT).map((n) =>
            n === SKELETON_INDEX ? (
              <div
                className={styles.skeleton}
                data-loaded={loaded}
                key="skeleton"
                onTransitionEnd={(e) => {
                  if (loaded || e.propertyName !== 'height') return;
                  const container = containerRef.current;
                  if (container !== null) {
                    scrollToSkeleton(container, e.currentTarget);
                  }
                }}
                ref={skeletonRef}
                style={{
                  height: loaded ? LOADED_HEIGHT : SKELETON_HEIGHT,
                  overflowAnchor: excluded ? 'none' : 'auto',
                }}
              >
                <p className={styles.skeletonText}>
                  {loaded
                    ? '読み込みが終わった本文。スケルトンより背が高い'
                    : '読み込み中のスケルトン'}
                </p>
              </div>
            ) : (
              <div className={styles.item} key={`item-${String(n)}`}>
                <p className={styles.itemText}>アイテム {String(n + 1)}</p>
              </div>
            ),
          )}
        </div>
      </section>

      <p className={styles.note}>
        スケルトンが表示領域の上端をまたいだ状態で、読み込み完了で背が高くなります。スケルトンがアンカーノードのままだと、その上端は動かないので直後のアイテムが押し出されます。
        <Code>overflow-anchor: none</Code>
        を付けると直後のアイテムがアンカーノードになり、高さの差だけスクロール位置が補正されて、見えていたアイテムはその場に留まります。
      </p>
    </div>
  );
}
