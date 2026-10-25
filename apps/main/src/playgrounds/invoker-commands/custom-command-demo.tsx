'use client';

import { useEffect, useRef } from 'react';

import styles from './custom-command-demo.module.css';

export function CustomCommandDemo() {
  const imageRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return undefined;

    const handleCommand = (event: Event) => {
      if (typeof CommandEvent === 'undefined') return;
      if (!(event instanceof CommandEvent)) return;
      const { command } = event;
      if (command === '') return;

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
    return () => {
      image.removeEventListener('command', handleCommand);
    };
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.actions}>
        <button
          className={styles.zoomButton}
          command="--zoom-in"
          commandfor="demo-image"
          type="button"
        >
          拡大
        </button>
        <button
          className={styles.zoomButton}
          command="--zoom-out"
          commandfor="demo-image"
          type="button"
        >
          縮小
        </button>
        <button
          className={styles.resetButton}
          command="--reset"
          commandfor="demo-image"
          type="button"
        >
          リセット
        </button>
      </div>

      <div className={styles.stage}>
        <div className={styles.image} id="demo-image" ref={imageRef}>
          <img
            alt="k8o"
            className={styles.photo}
            decoding="async"
            height={512}
            loading="lazy"
            src="/playgrounds/invoker-commands-k8o.avif"
            width={512}
          />
        </div>
      </div>

      <p className={styles.note}>
        カスタムコマンド（
        <code>--zoom-in</code>、<code>--zoom-out</code>、<code>--reset</code>
        ）で操作しています。
      </p>
    </div>
  );
}
