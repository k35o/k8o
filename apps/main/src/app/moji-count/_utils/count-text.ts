export const isSegmenter = !Reflect.has(globalThis.Intl, 'Segmenter');

const segmenter = isSegmenter
  ? null
  : new Intl.Segmenter('ja', { granularity: 'grapheme' });

export const countGraphemeLength = (text: string): number => {
  if (segmenter === null) {
    return text.split('').length;
  }

  return [...segmenter.segment(text)].length;
};
