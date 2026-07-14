import { buildOxlintrc } from './oxlintrc';

describe('buildOxlintrc', () => {
  describe('正常系', () => {
    it('extendsチェーン (base→typescript→react→nextjs) の4層がマージされる', () => {
      const rc = buildOxlintrc();

      expect(rc.plugins).toStrictEqual([
        'unicorn',
        'import',
        'promise',
        'typescript',
        'react',
        'jsx-a11y',
        'nextjs',
      ]);
      expect(rc.categories?.correctness).toBe('error');
      expect(rc.categories?.style).toBe('off');
      // 各層を代表するルールが1つのrulesに揃っていること
      expect(rc.rules?.['no-var']).toBe('error');
      expect(
        rc.rules?.['typescript/consistent-type-definitions'],
      ).toStrictEqual(['error', 'type']);
      expect(rc.rules?.['react/self-closing-comp']).toBe('error');
      expect(rc.rules?.['nextjs/no-img-element']).toBe('warn');
    });

    it('vite.config.tsと同じ上書きが反映される', () => {
      const rc = buildOxlintrc();

      expect(rc.rules?.['import/no-unassigned-import']).toStrictEqual([
        'error',
        { allow: ['**/*.css', '@/libs/zod', 'react', 'server-only'] },
      ]);
      expect(rc.rules?.['no-underscore-dangle']).toBe('off');
      expect(rc.options).toStrictEqual({
        reportUnusedDisableDirectives: 'error',
      });
      expect(rc.settings?.react).toStrictEqual({ version: '19.2.7' });
    });

    it('JSONへそのまま直列化できる', () => {
      const rc = buildOxlintrc();

      // oxlint-disable-next-line unicorn/prefer-structured-clone -- JSON 直列化の round-trip を検証するのが目的で structuredClone では代替できない
      expect(JSON.parse(JSON.stringify(rc))).toStrictEqual(rc);
    });
  });

  describe('エッジケース (Webツールでは再現しない設定)', () => {
    it('extendsを含まない', () => {
      expect(buildOxlintrc()).not.toHaveProperty('extends');
    });

    it('typeAwareを含まない', () => {
      expect(buildOxlintrc().options).not.toHaveProperty('typeAware');
    });

    it('tailwindのJSプラグインとルールを含まない', () => {
      const { rules = {}, ...rc } = buildOxlintrc();

      expect(rc).not.toHaveProperty('jsPlugins');
      const tailwindRules = Object.keys(rules).filter((rule) =>
        rule.startsWith('tailwindcss/'),
      );
      expect(tailwindRules).toStrictEqual([]);
    });
  });
});
