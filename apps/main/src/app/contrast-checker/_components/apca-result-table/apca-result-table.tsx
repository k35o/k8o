import { AlertIcon } from '@k8o/arte-odyssey';
import type { FC } from 'react';

type Props = {
  lc: number;
};

const APCA_LEVELS = [
  {
    threshold: 90,
    usage: '本文テキスト（推奨）',
    example: '長文の本文や14px程度の小さな文字',
  },
  {
    threshold: 75,
    usage: '本文テキストの最低基準',
    example: '18px程度の本文',
  },
  {
    threshold: 60,
    usage: '本文以外のテキストの最低基準',
    example: '24px程度の大きめのテキストや16pxの太字',
  },
  {
    threshold: 45,
    usage: '大きなテキストの最低基準',
    example: '36px以上の見出しや24px程度の太字',
  },
  {
    threshold: 30,
    usage: 'あらゆるテキストの下限',
    example: 'プレースホルダーや無効状態の文字を含む',
  },
  {
    threshold: 15,
    usage: '非テキスト要素の下限',
    example: 'アイコンや境界線など意味を持つ要素',
  },
] as const;

const Status: FC<{ isInvalid: boolean }> = ({ isInvalid }) =>
  isInvalid ? (
    <div className="text-fg-error flex items-center justify-center gap-1">
      <AlertIcon size="sm" status="error" />
      <span className="font-bold">NG</span>
    </div>
  ) : (
    <div className="text-fg-success flex items-center justify-center gap-1">
      <AlertIcon size="sm" status="success" />
      <span className="font-bold">OK</span>
    </div>
  );

export const ApcaResultTable: FC<Props> = ({ lc }) => {
  // APCAのLcは正負で文字と背景の明暗関係を表すため、判定には絶対値を使う
  const absLc = Math.abs(lc);

  return (
    <div className="border-border-base bg-bg-base overflow-hidden rounded-xl border">
      <div className="sm:hidden">
        {APCA_LEVELS.map((level) => (
          <div
            className="border-border-base flex flex-col gap-2 border-b p-4 last:border-b-0"
            key={level.threshold}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">Lc {level.threshold}以上</p>
              <Status isInvalid={absLc < level.threshold} />
            </div>
            <p className="text-sm">{level.usage}</p>
            <p className="text-fg-mute text-xs">{level.example}</p>
          </div>
        ))}
      </div>
      <table className="hidden w-full sm:table">
        <thead>
          <tr className="border-border-base bg-bg-mute md:text-md border-b text-xs font-medium sm:text-sm">
            <th className="px-3 py-2 sm:px-4 sm:py-3" scope="col">
              判定
            </th>
            <th className="px-3 py-2 sm:px-4 sm:py-3" scope="col">
              基準
            </th>
            <th className="px-3 py-2 text-left sm:px-4 sm:py-3" scope="col">
              用途
            </th>
          </tr>
        </thead>
        <tbody>
          {APCA_LEVELS.map((level) => (
            <tr
              className="border-border-base border-b last:border-b-0"
              key={level.threshold}
            >
              <td className="p-2 sm:py-3">
                <Status isInvalid={absLc < level.threshold} />
              </td>
              <td className="px-3 py-2 text-center font-bold whitespace-nowrap sm:px-4 sm:py-3">
                Lc {level.threshold}以上
              </td>
              <td className="px-3 py-2 sm:px-4 sm:py-3">
                <p className="text-sm md:text-base">{level.usage}</p>
                <p className="text-fg-mute text-xs md:text-sm">
                  {level.example}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
