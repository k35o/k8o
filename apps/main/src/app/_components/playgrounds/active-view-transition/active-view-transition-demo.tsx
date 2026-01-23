'use client';

import { ChevronIcon } from '@k8o/arte-odyssey';
import { Button } from '@k8o/arte-odyssey/button';
import { cn } from '@repo/helpers/cn';
import { useState } from 'react';

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

    if ('startViewTransition' in document) {
      const transition = document.startViewTransition({
        update: () => {
          setCurrentIndex(newIndex);
        },
        types: [direction],
      });

      setIsTransitioning(true);
      transition.finished.then(() => {
        setIsTransitioning(false);
      });
    } else {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="size-3 rounded-full bg-green-500 transition-indicator"
          />
          <span className="text-fg-muted text-sm">
            {isTransitioning ? '遷移中...' : '待機中'}
          </span>
        </div>
        <span className="text-fg-muted text-sm">
          {currentIndex + 1} / {CARDS.length}
        </span>
      </div>

      <div className="flex justify-center">
        <div
          className="card-content h-48 w-64 rounded-xl"
          style={{ backgroundColor: card.color }}
        />
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={() => navigate('backwards')}
          startIcon={<ChevronIcon direction="left" />}
        >
          戻る
        </Button>
        <Button
          endIcon={<ChevronIcon direction="right" />}
          onClick={() => navigate('forwards')}
        >
          進む
        </Button>
      </div>

      <div className="flex justify-center gap-2">
        {CARDS.map((c, index) => (
          <div
            className={cn(
              'size-2 rounded-full transition-colors',
              index === currentIndex ? 'bg-fg-base' : 'bg-border-base',
            )}
            key={c.id}
          />
        ))}
      </div>
    </div>
  );
}
