// React はハイドレーションより前に起きた img の error を拾わない。マウントしたあとに同じ src を
// 入れ直すと読み込みがやり直され、失敗していれば onError が呼ばれる（next/image と同じ回避）
export const replayImageError = (image: HTMLImageElement | null): void => {
  if (image === null) {
    return;
  }
  // oxlint-disable-next-line no-self-assign -- 同じ値を入れ直すことで読み込みをやり直させる
  image.src = image.src;
};
