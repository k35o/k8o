'use client';

import { Button, Code } from '@k8ordo/ui';
import { useRef } from 'react';

export function MutedAttributeDemo() {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="flex flex-col gap-6">
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

      <div className="mp-attr-player border-border-mute flex flex-col gap-4 rounded-xl border-2 p-4">
        {/* 台詞のない合成音なのでキャプション用のtrackは付けない */}
        {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          className="w-full"
          controls
          loop
          ref={audioRef}
          src="/playgrounds/media-pseudos-tone.wav"
        />
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          <li className="mp-attr-chip mp-attr-chip-attribute bg-bg-subtle text-fg-base rounded-full px-3 py-1 font-mono text-xs">
            audio[muted]
          </li>
          <li className="mp-attr-chip mp-attr-chip-pseudo bg-bg-subtle text-fg-base rounded-full px-3 py-1 font-mono text-xs">
            audio:muted
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
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

      <p className="text-fg-mute text-sm">
        <Code>muted</Code>
        属性は要素が作られたときの初期値を決めるだけで、あとから付け外ししても音は変わりません。コントロールのミュートボタンや
        <Code>muted</Code>プロパティで変えた今の状態を表すのは
        <Code>:muted</Code>だけです。
      </p>
    </div>
  );
}
