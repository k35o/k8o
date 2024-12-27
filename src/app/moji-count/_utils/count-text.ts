export const isSegmenter =
  typeof window === 'undefined' ||
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
