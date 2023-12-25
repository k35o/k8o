export const countGraphemeLength = (text: string): number => {
  // Intl.Segmenterを実装していないブラウザでは、ユニコードのコードポイント単位で数える
  if (
    typeof window === 'undefined' ||
    window.Intl === undefined ||
    window.Intl.Segmenter === undefined
  ) {
    return [...text].length;
  }

  // Intlを実装しているブラウザでは、grapheme単位で数える
  const segmenter = new Intl.Segmenter('ja', {
    granularity: 'grapheme',
  });
  return [...segmenter.segment(text)].length;
};