'use client';

import { Fragment } from 'react';
import type { FC } from 'react';

import styles from './pdf-page-text.module.css';

type Line = {
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type Block =
  | { tag: 'img'; alt: string }
  | { tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'; lines: Line[] };

// PDF の書体は手元に無く、同じ文字でも幅が違う。行ごとに測って PDF の幅へ伸縮しないと、選択の範囲が絵とずれる
const fitToImage = (root: HTMLDivElement): (() => void) => {
  const observer = new ResizeObserver((entries) => {
    for (const { target, contentBoxSize } of entries) {
      const size = contentBoxSize[0]?.inlineSize ?? 0;
      if (size === 0 || !(target instanceof HTMLElement)) continue;
      if (target === root) {
        const ratio = size / Number(root.dataset['width']);
        root.style.setProperty('--fit', ratio.toString());
      } else {
        const ratio = Number(target.dataset['width']) / size;
        target.style.setProperty('--stretch', ratio.toString());
      }
    }
  });
  observer.observe(root);
  for (const line of root.querySelectorAll('span[data-width]')) {
    observer.observe(line);
  }
  return () => {
    observer.disconnect();
  };
};

// PDF からは書体の名前が取れない。等幅を素の書体で描くと行の途中で 1 文字ほどずれるので、字送りの 0.6em で見分ける
const isMonospace = (text: string, width: number, size: number): boolean =>
  !/[\u3000-\uFFFF]/u.test(text) &&
  Math.abs(width / (size * text.length) - 0.6) < 0.01;

export const PdfPageText: FC<{
  width: number;
  height: number;
  blocks: readonly Block[];
}> = ({ width, height, blocks }) => (
  <div className={styles.root} data-width={width} ref={fitToImage}>
    <div className={styles.page} style={{ width, height }}>
      {blocks.map((block, blockIndex) => {
        if (block.tag === 'img') {
          return (
            <span
              aria-label={block.alt}
              className={styles.figure}
              // 文字のまとまりと行は並び替わらないため index を key に使う
              key={blockIndex}
              role="img"
            />
          );
        }
        const { tag: Tag, lines } = block;
        return (
          <Tag className={styles.block} key={blockIndex}>
            {lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && ' '}
                <span
                  className={styles.line}
                  data-monospace={isMonospace(
                    line.text,
                    line.width * width,
                    line.height * height,
                  )}
                  data-width={line.width * width}
                  style={{
                    left: line.left * width,
                    top: line.top * height,
                    fontSize: line.height * height,
                  }}
                >
                  {line.text}
                </span>
              </Fragment>
            ))}
          </Tag>
        );
      })}
    </div>
  </div>
);
