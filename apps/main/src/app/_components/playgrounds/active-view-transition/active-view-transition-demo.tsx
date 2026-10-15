'use client';

import { Button, ChevronIcon } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useState } from 'react';
import { flushSync } from 'react-dom';

import styles from './active-view-transition-demo.module.css';

type CardCount = (typeof CARDS)[number]['id'];

const CARDS = [
  { id: 0, color: 'var(--purple-500)' },
  { id: 1, color: 'var(--cyan-500)' },
  { id: 2, color: 'var(--teal-500)' },
  { id: 3, color: 'var(--yellow-500)' },
  { id: 4, color: 'var(--pink-500)' },
] as const satisfies ReadonlyArray<{ id: number; color: string }>;

export function ActiveViewTransitionDemo() {
  const [currentIndex, setCurrentIndex] = useState<CardCount>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const card = CARDS[currentIndex];

  const navigate = (direction: 'forwards' | 'backwards') => {
    const newIndex: CardCount = (
      direction === 'forwards'
        ? (currentIndex + 1) % CARDS.length
        : (currentIndex - 1 + CARDS.length) % CARDS.length
    ) as CardCount;

    // メソッドの存在だけではtypes付きオブジェクト引数に非対応なLevel 1実装
    // （Chrome 111-124等）を除外できないため、同時に実装された疑似クラスの
    // 対応可否で判定する
    if (
      'startViewTransition' in document &&
      CSS.supports('selector(:active-view-transition-type(forwards))')
    ) {
      const transition = document.startViewTransition({
        update: () => {
          // update完了時点のDOMがスナップショットされるため同期的にフラッシュする
          flushSync(() => {
            setCurrentIndex(newIndex);
          });
        },
        types: [direction],
      });

      setIsTransitioning(true);
      void transition.finished.then(() => {
        setIsTransitioning(false);
        return undefined;
      });
    } else {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className={styles.root}>
      <style>{`
        /* 遷移中にのみ表示されるインジケーター */
        .transition-indicator {
          opacity: 0;
          transition: opacity 0.1s;
        }
        html:active-view-transition .transition-indicator {
          opacity: 1;
        }

        /* カードのView Transition設定 */
        html:active-view-transition {
          .card-content {
            view-transition-name: card;
          }
        }

        /* forwards: 弾けて散る */
        html:active-view-transition-type(forwards) {
          &::view-transition-old(card) {
            animation: 500ms cubic-bezier(0.4, 0, 1, 1) explode-out;
          }
          &::view-transition-new(card) {
            animation: 500ms cubic-bezier(0, 0, 0.2, 1) gather-in;
          }
        }

        /* backwards: 集まってくる */
        html:active-view-transition-type(backwards) {
          &::view-transition-old(card) {
            animation: 500ms cubic-bezier(0.4, 0, 1, 1) shrink-out;
          }
          &::view-transition-new(card) {
            animation: 500ms cubic-bezier(0, 0, 0.2, 1) expand-in;
          }
        }

        @keyframes explode-out {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(1.5) rotate(10deg); opacity: 0; }
        }
        @keyframes gather-in {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes shrink-out {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
        }
        @keyframes expand-in {
          0% { transform: scale(1.5) rotate(10deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>

      <div className={styles.status}>
        <div className={styles.state}>
          <div
            aria-hidden="true"
            className={cn('transition-indicator', styles.dot)}
          />
          <output className={styles.caption}>
            {isTransitioning ? '遷移中...' : '待機中'}
          </output>
        </div>
        <span className={styles.caption}>
          {currentIndex + 1} / {CARDS.length}
        </span>
      </div>

      <div className={styles.stage}>
        <div
          className={cn('card-content', styles.card)}
          style={{ backgroundColor: card.color }}
        />
      </div>

      <div className={styles.actions}>
        <Button
          onClick={() => {
            navigate('backwards');
          }}
          startIcon={<ChevronIcon direction="left" />}
        >
          戻る
        </Button>
        <Button
          endIcon={<ChevronIcon direction="right" />}
          onClick={() => {
            navigate('forwards');
          }}
        >
          進む
        </Button>
      </div>

      <div className={styles.pager}>
        {CARDS.map((c, index) => (
          <div
            className={styles.pagerDot}
            data-active={index === currentIndex}
            key={c.id}
          />
        ))}
      </div>
    </div>
  );
}
