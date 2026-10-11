'use client';

import { Button, Code } from '@k8ordo/ui';
import type { AnimationEvent as ReactAnimationEvent } from 'react';
import { useState } from 'react';

type AnimationEventType =
  | 'animationstart'
  | 'animationiteration'
  | 'animationend';

type LogEntry = {
  id: number;
  type: AnimationEventType;
  animationName: string;
  duration: string;
  playState: string;
  inGetAnimations: boolean | null;
};

const TARGET_CLASS = 'animation-accessors-target';

const targetStyle = `@keyframes beat {
  50% {
    opacity: 0.2;
  }
}

.${TARGET_CLASS} {
  animation:
    beat 0.5s 3,
    beat 0.8s 3;
}`;

// lib.dom には AnimationEvent.animation がまだ無いので、in と instanceof で絞り込む
const readAnimation = (nativeEvent: AnimationEvent): CSSAnimation | null => {
  if (!('animation' in nativeEvent)) return null;
  const { animation } = nativeEvent;
  return animation instanceof CSSAnimation ? animation : null;
};

const formatDuration = (animation: CSSAnimation): string => {
  const duration = animation.effect?.getTiming().duration;
  return typeof duration === 'number'
    ? `${duration}ms`
    : String(duration ?? '—');
};

export function AnimationAccessorsDemo() {
  const [run, setRun] = useState(0);
  const [log, setLog] = useState<readonly LogEntry[]>([]);

  const record =
    (type: AnimationEventType) =>
    (event: ReactAnimationEvent<HTMLDivElement>): void => {
      const animation = readAnimation(event.nativeEvent);
      const entry: Omit<LogEntry, 'id'> = {
        type,
        animationName: event.animationName,
        duration: animation === null ? '—' : formatDuration(animation),
        playState: animation?.playState ?? '—',
        inGetAnimations:
          type === 'animationend' && animation !== null
            ? event.currentTarget.getAnimations().includes(animation)
            : null,
      };
      setLog((prev) => [...prev, { ...entry, id: prev.length + 1 }]);
    };

  return (
    <div className="flex flex-col gap-6">
      <style>{targetStyle}</style>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => {
            setRun((prev) => prev + 1);
            setLog([]);
          }}
          size="sm"
        >
          再生
        </Button>
        {/* keyを変えて作り直し、2本のCSSAnimationを毎回新しく始める */}
        <div
          aria-hidden="true"
          className={`bg-primary-bg size-12 rounded-lg ${run === 0 ? '' : TARGET_CLASS}`}
          key={run}
          onAnimationEnd={record('animationend')}
          onAnimationIteration={record('animationiteration')}
          onAnimationStart={record('animationstart')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-fg-base text-sm font-bold">イベントのログ</p>
        {log.length === 0 ? (
          <p className="text-fg-mute text-sm">
            再生を押すと、イベントごとに<Code>event.animation</Code>
            から読んだ値が並びます
          </p>
        ) : (
          <ol className="flex flex-col gap-1">
            {log.map((entry) => (
              <li
                className="text-fg-mute flex flex-wrap gap-x-3 font-mono text-xs"
                key={entry.id}
              >
                <span className="text-fg-base font-bold">{entry.type}</span>
                <span>
                  animationName:{' '}
                  <span className="text-fg-base">{entry.animationName}</span>
                </span>
                <span>
                  animation.effect.getTiming().duration:{' '}
                  <span className="text-fg-base">{entry.duration}</span>
                </span>
                <span>
                  animation.playState:{' '}
                  <span className="text-fg-base">{entry.playState}</span>
                </span>
                {entry.inGetAnimations !== null && (
                  <span>
                    getAnimations().includes(animation):{' '}
                    <span className="text-fg-base">
                      {String(entry.inGetAnimations)}
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-fg-mute text-sm">
          要素に当てているCSSです。<Code>animationName</Code>
          はどちらも<Code>beat</Code>ですが、<Code>event.animation</Code>
          のdurationで2本を区別できます。
        </p>
        <pre className="text-fg-mute my-0 overflow-x-auto text-xs">
          <code>{targetStyle}</code>
        </pre>
      </div>
    </div>
  );
}
