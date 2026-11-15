import { describe, expect, it } from 'vitest';

import { DEMO_MESSAGE, readDemoFrameMessage } from './demo-message';

describe('readDemoFrameMessage', () => {
  describe('正常系', () => {
    it('ready と height を読む', () => {
      expect(readDemoFrameMessage({ type: DEMO_MESSAGE.ready })).toStrictEqual({
        type: DEMO_MESSAGE.ready,
      });
      expect(
        readDemoFrameMessage({ type: DEMO_MESSAGE.height, height: 56 }),
      ).toStrictEqual({ type: DEMO_MESSAGE.height, height: 56 });
    });
  });

  describe('異常系', () => {
    it('形の違う値は読まない', () => {
      expect(readDemoFrameMessage(DEMO_MESSAGE.ready)).toBeUndefined();
      expect(readDemoFrameMessage(null)).toBeUndefined();
      expect(readDemoFrameMessage({ type: 'other' })).toBeUndefined();
    });

    it('数でない、負の、有限でない高さは読まない', () => {
      for (const height of ['56', -1, Number.POSITIVE_INFINITY, Number.NaN]) {
        expect(
          readDemoFrameMessage({ type: DEMO_MESSAGE.height, height }),
        ).toBeUndefined();
      }
    });
  });
});
