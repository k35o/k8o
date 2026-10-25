'use client';

import { Button, Code } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useRef } from 'react';

import styles from './muted-attribute-demo.module.css';

export function MutedAttributeDemo() {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className={styles.root}>
      <style>{`
        .mp-attr-chip {
          opacity: 0.35;
          transition: opacity 150ms;
        }
        .mp-attr-player:has(audio[muted]) .mp-attr-chip-attribute,
        .mp-attr-player:has(audio:muted) .mp-attr-chip-pseudo {
          opacity: 1;
        }
      `}</style>

      <div className={cn('mp-attr-player', styles.player)}>
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
          <li
            className={cn('mp-attr-chip mp-attr-chip-attribute', styles.chip)}
          >
            audio[muted]
          </li>
          <li className={cn('mp-attr-chip mp-attr-chip-pseudo', styles.chip)}>
            audio:muted
          </li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Button
          onClick={() => {
            const audio = audioRef.current;
            if (audio === null) return;
            audio.muted = !audio.muted;
          }}
        >
          mutedプロパティを反転
        </Button>
        <Button
          color="base"
          onClick={() => {
            const audio = audioRef.current;
            if (audio === null) return;
            audio.toggleAttribute('muted');
          }}
          variant="outline"
        >
          muted属性を付け外し
        </Button>
      </div>

      <p className={styles.note}>
        <Code>muted</Code>
        属性は要素が作られたときの初期値を決めるだけで、あとから付け外ししても音は変わりません。コントロールのミュートボタンや
        <Code>muted</Code>プロパティで変えた今の状態を表すのは
        <Code>:muted</Code>だけです。
      </p>
    </div>
  );
}
