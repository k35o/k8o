export const isSegmenter = !Reflect.has(globalThis.Intl, 'Segmenter');

const segmenter = isSegmenter
  ? null
  : new Intl.Segmenter('ja', { granularity: 'grapheme' });

export const countGraphemeLength = (text: string): number => {
  // Intl.Segmenterを実装していないブラウザでは、ユニコードのコードポイント単位で数える
  if (segmenter === null) {
    return text.split('').length;
  }

  // Intlを実装しているブラウザでは、grapheme単位で数える
  return [...segmenter.segment(text)].length;
};
