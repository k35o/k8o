import type { FC } from 'react';

import styles from './pdf-page.module.css';

type Link = {
  href: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

const percent = (ratio: number): string => `${(ratio * 100).toString()}%`;

// PDF の 1 ページ。画像の上に、PDF のリンクと同じ位置の透明なリンクを重ねる
export const PdfPage: FC<{
  alt: string;
  src: string;
  srcSet: string;
  width: number;
  height: number;
  links: readonly Link[];
}> = ({ alt, src, srcSet, width, height, links }) => (
  <div className={styles.root}>
    <div
      className={styles.sheet}
      style={{ '--ratio': (width / height).toString() }}
    >
      {/* React は、サーバーで描いた img ごとに preload を head へ書く。デッキは全ページの img を先に描いて渡すので、
          開いた時に全ページの画像を読み、ページ送りを待たせず、発表中に回線が切れても次のページが出る。
          loading を lazy に、fetchPriority を low にすると、その preload が止まる */}
      <img
        alt={alt}
        className={styles.image}
        height={height}
        sizes="100vw"
        src={src}
        srcSet={srcSet}
        width={width}
      />
      {links.map((link, index) => (
        <a
          aria-label={link.href}
          className={styles.link}
          href={link.href}
          // リンクは並び替わらないため index を key に使う
          key={index}
          rel="noreferrer"
          style={{
            left: percent(link.left),
            top: percent(link.top),
            width: percent(link.width),
            height: percent(link.height),
          }}
          target="_blank"
        />
      ))}
    </div>
  </div>
);
