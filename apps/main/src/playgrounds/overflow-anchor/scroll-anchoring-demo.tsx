'use client';

import { Button, Code, Switch } from '@k8ordo/ui';
import { range } from '@repo/helpers/array/range';
import { useEffect, useRef, useState } from 'react';

import styles from './scroll-anchoring-demo.module.css';

const INITIAL_COUNT = 12;
const MAP_HEIGHT = 224;

type Metrics = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  prependedHeight: number;
};

const measure = (container: HTMLElement, prepended: HTMLElement): Metrics => ({
  scrollTop: Math.round(container.scrollTop),
  scrollHeight: container.scrollHeight,
  clientHeight: container.clientHeight,
  prependedHeight: prepended.offsetHeight,
});

const scrollToMiddle = (container: HTMLElement): void => {
  container.scrollTop = container.scrollHeight / 2;
};

export function ScrollAnchoringDemo() {
  const [anchoring, setAnchoring] = useState(true);
  const [prepended, setPrepended] = useState(0);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const prependedRef = useRef<HTMLDivElement>(null);

  // 最初にスクロール位置を途中まで進めておく。位置0だと補正が抑制されて違いが見えない。
  // 以降は scroll イベントと、要素の追加で先頭ブロックの高さが変わったときに測り直す
  useEffect(() => {
    const container = containerRef.current;
    const prependedBlock = prependedRef.current;
    if (container === null || prependedBlock === null) return undefined;
    scrollToMiddle(container);
    setMetrics(measure(container, prependedBlock));
    const observer = new ResizeObserver(() => {
      setMetrics(measure(container, prependedBlock));
    });
    observer.observe(prependedBlock);
    return () => {
      observer.disconnect();
    };
  }, []);

  const scale = metrics === null ? 0 : MAP_HEIGHT / metrics.scrollHeight;

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <Switch
          checked={anchoring}
          label="overflow-anchor: auto（補正あり）"
          onChange={setAnchoring}
        />
        <Button
          onClick={() => {
            setPrepended((prev) => prev + 1);
          }}
        >
          先頭に要素を追加
        </Button>
        <Button
          color="base"
          onClick={() => {
            setPrepended(0);
            const container = containerRef.current;
            const prependedBlock = prependedRef.current;
            if (container !== null && prependedBlock !== null) {
              scrollToMiddle(container);
              setMetrics(measure(container, prependedBlock));
            }
          }}
          variant="outline"
        >
          リセット
        </Button>
      </div>

      <div className={styles.body}>
        <section
          aria-label="スクロールアンカリングを確認するスクロール領域"
          className={styles.scroller}
          onScroll={(e) => {
            const prependedBlock = prependedRef.current;
            if (prependedBlock !== null) {
              setMetrics(measure(e.currentTarget, prependedBlock));
            }
          }}
          ref={containerRef}
          style={{
            overflowAnchor: anchoring ? 'auto' : 'none',
            // オーバーレイスクロールバーの環境でも常に表示して、位置の変化を見せる
            scrollbarColor: 'var(--color-fg-subtle) var(--color-bg-subtle)',
          }}
          tabIndex={0}
        >
          <div className={styles.list}>
            <div className={styles.prepended} ref={prependedRef}>
              {range(0, prepended).map((n) => (
                <div
                  className={styles.prependedItem}
                  key={`prepended-${String(n)}`}
                >
                  あとから先頭に追加された要素 {String(prepended - n)}
                </div>
              ))}
            </div>
            {range(0, INITIAL_COUNT).map((n) => (
              <div className={styles.item} key={`item-${String(n)}`}>
                <p className={styles.itemText}>アイテム {String(n + 1)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* スクロール領域の全体を縦に縮めた地図。追加した要素の領域と、いま見えている範囲を重ねる */}
        <div
          aria-hidden="true"
          className={styles.map}
          style={{ height: MAP_HEIGHT }}
        >
          {metrics !== null && (
            <>
              <div
                className={styles.mapPrepended}
                style={{ height: metrics.prependedHeight * scale }}
              />
              <div
                className={styles.mapViewport}
                style={{
                  top: metrics.scrollTop * scale,
                  height: metrics.clientHeight * scale,
                }}
              />
            </>
          )}
        </div>
      </div>

      {metrics !== null && (
        <dl className={styles.metrics}>
          <dt className={styles.metricName}>scrollTop</dt>
          <dd className={styles.metricValue}>{String(metrics.scrollTop)}px</dd>
          <dt className={styles.metricName}>先頭に追加した要素の高さ</dt>
          <dd className={styles.metricValue}>
            {String(metrics.prependedHeight)}px
          </dd>
        </dl>
      )}

      <p className={styles.note}>
        途中までスクロールした状態で先頭に要素を足します。右の帯は領域全体を縮めた地図で、上の塗りが追加した要素、枠がいま見えている範囲です。
        <Code>auto</Code>
        では枠が追加した高さのぶん下へ動いて見えているアイテムが留まり、
        <Code>none</Code>
        では枠が動かず、見えていたアイテムが下へ押し出されます。
      </p>
    </div>
  );
}
