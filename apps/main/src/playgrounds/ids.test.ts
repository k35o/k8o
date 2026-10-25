import { describe, expect, it } from 'vitest';

import { playgroundIds } from './ids';
import { playgroundSections } from './sections';

describe('playgroundIds', () => {
  describe('正常系', () => {
    it('sections.ts のセクションの id を、過不足なく1つずつ持つ', () => {
      expect(playgroundIds.toSorted()).toStrictEqual(
        playgroundSections.map((section) => section.id).toSorted(),
      );
    });
  });
});
