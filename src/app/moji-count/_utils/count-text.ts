export const isSegmenter =
  typeof window === 'undefined' ||
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- 対応していないブラウザを検知するため
  window.Intl.Segmenter === undefined;

export const countGraphemeLength = (text: string): number => {
  // Intl.Segmenterを実装していないブラウザでは、ユニコードのコードポイント単位で数える
  if (isSegmenter) {
    return [...text].length;
  }

  // Intlを実装しているブラウザでは、grapheme単位で数える
  const segmenter = new Intl.Segmenter('ja', {
    granularity: 'grapheme',
  });
  return [...segmenter.segment(text)].length;
};
