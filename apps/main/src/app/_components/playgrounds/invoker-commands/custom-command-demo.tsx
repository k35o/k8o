'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import k8oIcon from '@/app/_images/k8o.jpg';

export function CustomCommandDemo() {
  const imageRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const handleCommand = (event: Event) => {
      const commandEvent = event as Event & { command?: string };
      const command = commandEvent.command;
      if (!command) return;

      if (command === '--zoom-in') {
        scaleRef.current = Math.min(scaleRef.current + 0.25, 2);
        image.style.scale = `${scaleRef.current}`;
      } else if (command === '--zoom-out') {
        scaleRef.current = Math.max(scaleRef.current - 0.25, 0.5);
        image.style.scale = `${scaleRef.current}`;
      } else if (command === '--reset') {
        scaleRef.current = 1;
        image.style.scale = '1';
      }
    };

    image.addEventListener('command', handleCommand);
    return () => image.removeEventListener('command', handleCommand);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          className="rounded-md bg-primary-base px-4 py-2 text-primary-fg"
          // @ts-expect-error -- commandfor is not yet in TypeScript types
          // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
          command="--zoom-in"
          // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
          commandfor="demo-image"
          type="button"
        >
          拡大
        </button>
        <button
          className="rounded-md bg-primary-base px-4 py-2 text-primary-fg"
          // @ts-expect-error -- commandfor is not yet in TypeScript types
          // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
          command="--zoom-out"
          // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
          commandfor="demo-image"
          type="button"
        >
          縮小
        </button>
        <button
          className="rounded-md bg-bg-mute px-4 py-2 text-fg-base hover:bg-bg-subtle"
          // @ts-expect-error -- commandfor is not yet in TypeScript types
          // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
          command="--reset"
          // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
          commandfor="demo-image"
          type="button"
        >
          リセット
        </button>
      </div>

      <div className="flex items-center justify-center rounded-lg border border-border-base bg-bg-base p-8">
        <div
          className="h-24 w-24 overflow-hidden rounded-full transition-all duration-300"
          id="demo-image"
          ref={imageRef}
        >
          <Image
            alt="k8o"
            className="h-full w-full object-cover"
            src={k8oIcon}
          />
        </div>
      </div>

      <p className="text-fg-mute text-sm">
        カスタムコマンド（
        <code className="rounded bg-bg-subtle px-1">--zoom-in</code>、
        <code className="rounded bg-bg-subtle px-1">--zoom-out</code>、
        <code className="rounded bg-bg-subtle px-1">--reset</code>
        ）で操作しています。
      </p>
    </div>
  );
}
