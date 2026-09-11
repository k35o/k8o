'use client';

import { Button, Code } from '@k8ordo/ui';
import { useRef } from 'react';

const bars = [0, 1, 2, 3, 4];

export function PlaybackStateDemo() {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes mp-bounce {
          from { scale: 1 0.15; }
          to { scale: 1 1; }
        }

        .mp-player {
          border: 2px solid var(--color-border-mute);
          transition: border-color 150ms, background-color 150ms;
        }
        .mp-player:has(audio:playing) {
          border-color: var(--color-primary-border);
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

      <div className="mp-player flex flex-col gap-4 rounded-xl p-4">
        <div className="flex h-16 items-end justify-center gap-2">
          {bars.map((bar) => (
            <span
              className="mp-bar bg-primary-fg block h-full w-3 rounded-full"
              key={bar}
              style={{ animationDelay: `${String(bar * 90)}ms` }}
            />
          ))}
        </div>
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
          <li className="mp-chip mp-chip-playing bg-bg-subtle text-fg-base rounded-full px-3 py-1 font-mono text-xs">
            :playing
          </li>
          <li className="mp-chip mp-chip-paused bg-bg-subtle text-fg-base rounded-full px-3 py-1 font-mono text-xs">
            :paused
          </li>
          <li className="mp-chip mp-chip-muted bg-bg-subtle text-fg-base rounded-full px-3 py-1 font-mono text-xs">
            :muted
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
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

      <p className="text-fg-mute text-sm">
        バーのアニメーションは<Code>animation-play-state</Code>を
        <Code>.player:has(audio:playing)</Code>
        で切り替えているだけです。ネイティブのコントロールから操作しても、ボタンから
        <Code>play()</Code>を呼んでも、CSSは同じように追従します。
      </p>
    </div>
  );
}
