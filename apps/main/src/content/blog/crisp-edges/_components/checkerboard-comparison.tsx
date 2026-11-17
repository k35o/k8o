import { Code } from '@k8ordo/ui';

import styles from './checkerboard-comparison.module.css';

// 4×4 の白黒の市松模様。拡大のされ方だけを見せる小さな画像なので、ファイルを置かずに埋め込む
const CHECKERBOARD =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAAAAACMmsGiAAAAD0lEQVR4nGNg+A+FDHAWAE/EB/n9FK12AAAAAElFTkSuQmCC';

const VALUES = ['auto', 'crisp-edges', 'pixelated'] as const;

export const CheckerboardComparison = () => (
  <div className={styles.root}>
    {VALUES.map((value) => (
      <figure className={styles.item} key={value}>
        <img
          alt={`4×4の市松模様を${value}で102pxに拡大したもの`}
          className={styles.image}
          data-rendering={value}
          height={102}
          src={CHECKERBOARD}
          width={102}
        />
        <figcaption>
          <Code>{value}</Code>
        </figcaption>
      </figure>
    ))}
  </div>
);
