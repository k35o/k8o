'use client';

import { Button, Code } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useRef } from 'react';

import styles from './playback-state-demo.module.css';

const bars = [0, 1, 2, 3, 4];

export function PlaybackStateDemo() {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className={styles.root}>
      <style>{`
        @keyframes mp-bounce {
          from { scale: 1 0.15; }
          to { scale: 1 1; }
        }

        .mp-player {
          background-color: var(--color-bg-subtle);
          transition: background-color 150ms;
        }
        .mp-player:has(audio:playing) {
          background-color: var(--color-primary-bg-subtle);
        }

        .mp-bar {
          transform-origin: bottom;
          animation: mp-bounce 480ms ease-in-out infinite alternate;
          animation-play-state: paused;
        }
        .mp-player:has(audio:playing) .mp-bar {
          animation-play-state: running;
        }
        .mp-player:has(audio:muted) .mp-bar {
          opacity: 0.3;
        }

        .mp-chip {
          opacity: 0.35;
          transition: opacity 150ms;
        }
        .mp-player:has(audio:playing) .mp-chip-playing,
        .mp-player:has(audio:paused) .mp-chip-paused,
        .mp-player:has(audio:muted) .mp-chip-muted {
          opacity: 1;
        }
      `}</style>

      <div className={cn('mp-player', styles.player)}>
        <div className={styles.bars}>
          {bars.map((bar) => (
            <span
              className={cn('mp-bar', styles.bar)}
              key={bar}
              style={{ animationDelay: `${String(bar * 90)}ms` }}
            />
          ))}
        </div>
        {/* 台詞のない合成音なのでキャプション用のtrackは付けない */}
        {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          className={styles.audio}
          controls
          loop
          ref={audioRef}
          src="/playgrounds/media-pseudos-tone.wav"
        />
        <ul className={styles.chips}>
          <li className={cn('mp-chip mp-chip-playing', styles.chip)}>
            :playing
          </li>
          <li className={cn('mp-chip mp-chip-paused', styles.chip)}>:paused</li>
          <li className={cn('mp-chip mp-chip-muted', styles.chip)}>:muted</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Button
          onClick={() => {
            void audioRef.current?.play();
          }}
        >
          play()
        </Button>
        <Button
          color="base"
          onClick={() => {
            audioRef.current?.pause();
          }}
          variant="outline"
        >
          pause()
        </Button>
        <Button
          color="base"
          onClick={() => {
            const audio = audioRef.current;
            if (audio === null) return;
            audio.muted = !audio.muted;
          }}
          variant="outline"
        >
          mutedを反転
        </Button>
      </div>

      <p className={styles.note}>
        バーのアニメーションは<Code>animation-play-state</Code>を
        <Code>.player:has(audio:playing)</Code>
        で切り替えているだけです。ネイティブのコントロールから操作しても、ボタンから
        <Code>play()</Code>を呼んでも、CSSは同じように追従します。
      </p>
    </div>
  );
}
