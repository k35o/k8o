import type { FC } from 'react';

// サーバー（UTC）とブラウザで同じ文字列にしないとハイドレーションがずれるので、時刻帯を固定する
const updatedAtFormat = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

type UpdatedAtProps = {
  dateTime: string;
};

export const UpdatedAt: FC<UpdatedAtProps> = ({ dateTime }) => (
  <time dateTime={dateTime}>{updatedAtFormat.format(new Date(dateTime))}</time>
);
