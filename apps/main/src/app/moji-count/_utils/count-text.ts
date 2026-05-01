export const isSegmenter = !Reflect.has(globalThis.Intl, 'Segmenter');

export const countGraphemeLength = (text: string): number => {
  // Intl.Segmenterを実装していないブラウザでは、ユニコードのコードポイント単位で数える
  if (isSegmenter) {
    return text.split('').length;
  }

  // Intlを実装しているブラウザでは、grapheme単位で数える
  const segmenter = new Intl.Segmenter('ja', {
    granularity: 'grapheme',
  });
  return [...segmenter.segment(text)].length;
};
