import path from 'node:path';

import { computeTemplateHash } from './template-hash';
import { templateSnapshot } from './template-snapshot';

// sandbox-template は bake の元ネタ（apps/ai/sandbox-template）。
const templateDir = path.resolve(
  import.meta.dirname,
  '../../../../sandbox-template',
);

describe('template-snapshot', () => {
  describe('正常系', () => {
    // テンプレを変更したのに再bake（template-snapshot.ts の更新）を忘れると落ちる。
    // = 「テンプレ変更が snapshot に反映されない」事故を CI で構造的に防ぐためのガード。
    it('templateHash が現在の sandbox-template の内容と一致する', async () => {
      // Arrange & Act
      const current = await computeTemplateHash(templateDir);

      // Assert
      expect(templateSnapshot.templateHash).toBe(current);
    });
  });
});
