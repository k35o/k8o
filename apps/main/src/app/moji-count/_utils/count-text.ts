const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });

export const countGraphemeLength = (text: string): number =>
  [...segmenter.segment(text)].length;
