import type { FC } from 'react';
import { encode } from 'uqr';
import type { QrCodeGenerateResult } from 'uqr';

// 同じ URL の QR は重複生成しない (key={index} で Stage が remount される時の再計算抑止)
const qrCache = new Map<string, QrCodeGenerateResult>();

const getQrMatrix = (url: string): QrCodeGenerateResult => {
  let cached = qrCache.get(url);
  if (cached === undefined) {
    cached = encode(url, { border: 1, ecc: 'M' });
    qrCache.set(url, cached);
  }
  return cached;
};

export const SlideQRCode: FC<{ url: string; className?: string }> = ({
  url,
  className,
}) => {
  const { size, data } = getQrMatrix(url);

  // 動的生成するインライン SVG のため img タグへ置き換えられない。多数の
  // rect を支援技術に走査させず 1 枚の画像として読み上げさせるには
  // role="img" + aria-label が適切なので prefer-tag-over-role を無効化する。
  /* oxlint-disable jsx-a11y/prefer-tag-over-role */
  return (
    <svg
      aria-label={`QRコード: ${url}`}
      className={className}
      role="img"
      viewBox={`0 0 ${size.toString()} ${size.toString()}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="white" height={size} width={size} />
      {data.flatMap((row, y) =>
        row
          .map((cell, x) =>
            cell ? (
              <rect
                fill="black"
                height={1}
                key={`${y.toString()}-${x.toString()}`}
                width={1}
                x={x}
                y={y}
              />
            ) : null,
          )
          .filter((node) => node !== null),
      )}
    </svg>
  );
  /* oxlint-enable jsx-a11y/prefer-tag-over-role */
};
