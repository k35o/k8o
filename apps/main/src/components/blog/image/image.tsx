import type { FC } from 'react';

import styles from './image.module.css';

const originalUrls = import.meta.glob<string>(
  ['@/content/blog/*/_images/*.avif', '!@/content/blog/*/_images/*.*w.avif'],
  { eager: true, import: 'default' },
);

// 小さい版は data: URI になり、srcset に入れると HTML と preload とペイロードに埋まるので、ファイルで配る
const variantUrls = import.meta.glob<string>(
  '@/content/blog/*/_images/*.*w.avif',
  { eager: true, import: 'default', query: '?no-inline' },
);

const VARIANT_FILE = /^(.+)\.(\d+)w\.avif$/u;

const variantsBySrc = Map.groupBy(
  Object.entries(variantUrls).flatMap(([file, url]) => {
    const [, original, width] = VARIANT_FILE.exec(file) ?? [];
    const src =
      original === undefined ? undefined : originalUrls[`${original}.avif`];
    return src === undefined ? [] : [{ src, url, width: Number(width) }];
  }),
  (variant) => variant.src,
);

// 元の画像の実寸はここでは分からない。width は表示する幅の上限なので、元の画像はその幅として挙げ、
// それより広い版は外す
const srcSetOf = (src: string, width: number): string | undefined => {
  const narrower = (variantsBySrc.get(src) ?? [])
    .filter((variant) => variant.width < width)
    .toSorted((a, b) => a.width - b.width);
  return narrower.length === 0
    ? undefined
    : [
        ...narrower.map(
          (variant) => `${variant.url} ${String(variant.width)}w`,
        ),
        `${src} ${String(width)}w`,
      ].join(', ');
};

// 本文の列の幅（global-layout と blog-layout の余白を引いたもの）。sizes の auto を読まないブラウザと、
// lazy でない画像が使う
const COLUMN_SIZES =
  '(width >= 80rem) 59rem, (width >= 40rem) calc(100vw - 7rem), calc(100vw - 4rem)';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: 'eager' | 'lazy';
};

export const Image: FC<Props> = ({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
}) => {
  const srcSet = srcSetOf(src, width);
  return (
    <figure className={styles.figure}>
      <img
        alt={alt}
        className={styles.image}
        decoding="async"
        height={height}
        loading={loading}
        sizes={
          srcSet === undefined
            ? undefined
            : loading === 'lazy'
              ? `auto, ${COLUMN_SIZES}`
              : COLUMN_SIZES
        }
        src={src}
        srcSet={srcSet}
        width={width}
      />
      {alt !== '' && (
        <figcaption
          // alt と同じ文を読み上げで二重にしない
          aria-hidden
          className={styles.caption}
        >
          {alt}
        </figcaption>
      )}
    </figure>
  );
};

export const FloatImage: FC<Props> = (props) => (
  <div className={styles.float}>
    <Image {...props} />
  </div>
);
