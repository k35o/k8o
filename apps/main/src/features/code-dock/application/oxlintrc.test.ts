import { buildOxlintrc } from './oxlintrc';

describe('buildOxlintrc', () => {
  describe('正常系', () => {
    it('extendsチェーン (base→typescript→react→nextjs) の4層がマージされる', () => {
      const rc = buildOxlintrc();

      expect(rc.plugins).toEqual([
        'eslint',
        'oxc',
        'unicorn',
        'import',
        'promise',
        'typescript',
        'react',
        'jsx-a11y',
        'react-perf',
        'nextjs',
      ]);
      expect(rc.categories?.correctness).toBe('error');
      expect(rc.categories?.style).toBe('off');
      // 各層を代表するルールが1つのrulesに揃っていること
      expect(rc.rules?.eqeqeq).toEqual(['error', 'always']);
      expect(rc.rules?.['typescript/consistent-type-definitions']).toEqual([
        'error',
        'type',
      ]);
      expect(rc.rules?.['react/rules-of-hooks']).toBe('error');
      expect(rc.rules?.['nextjs/no-img-element']).toBe('warn');
    });

    it('vite.config.tsと同じ上書きが反映される', () => {
      const rc = buildOxlintrc();

      expect(rc.rules?.['import/no-unassigned-import']).toEqual([
        'error',
        { allow: ['**/*.css', '@/libs/zod', 'react', 'server-only'] },
      ]);
      expect(rc.rules?.['no-underscore-dangle']).toBe('off');
      expect(rc.options).toEqual({ reportUnusedDisableDirectives: 'error' });
      expect(rc.settings?.react).toEqual({ version: '19.2.7' });
    });

    it('JSONへそのまま直列化できる', () => {
      const rc = buildOxlintrc();

      expect(JSON.parse(JSON.stringify(rc))).toEqual(rc);
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
      expect(tailwindRules).toEqual([]);
    });
  });
});
