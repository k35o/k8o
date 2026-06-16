export const hasSegmenter = Reflect.has(globalThis.Intl, 'Segmenter');

const segmenter = hasSegmenter
  ? new Intl.Segmenter('ja', { granularity: 'grapheme' })
  : null;

export const countGraphemeLength = (text: string): number => {
  if (segmenter === null) {
    return text.split('').length;
  }

  return [...segmenter.segment(text)].length;
};
