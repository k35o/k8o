import { TextlintKernelDescriptor } from '@textlint/kernel';
import { moduleInterop } from '@textlint/module-interop';

export const getDescriptor = async () => {
  return new TextlintKernelDescriptor({
    rules: [
      {
        ruleId: 'ja-simple-user-dictionary',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-ja-simple-user-dictionary'))
            .default,
        ),
        options: {
          dictionary: [
            {
              pattern: 'シュミレーション',
              message:
                '「シュミレーション」ではなく「シミュレーション」です。',
            },
            {
              pattern: 'メモリー',
              message: '「メモリー」ではなく「メモリ」です。',
            },
            {
              pattern: 'コンピューター',
              message:
                '「コンピューター」ではなく「コンピュータ」です。',
            },
          ],
        },
      },
      {
        ruleId: 'max-ten',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-max-ten')).default,
        ),
        options: {
          max: 3,
          strict: false,
          touten: '、',
          kuten: '。',
        },
      },
      {
        ruleId: 'max-kanji-continuous-len',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-max-kanji-continuous-len'))
            .default,
        ),
        options: {
          max: 6,
        },
      },
      {
        ruleId: 'no-mix-dearu-desumasu',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-no-mix-dearu-desumasu'))
            .default,
        ),
        options: {
          'no-mix-dearu-desumasu': true,
        },
      },
      {
        ruleId: 'no-double-negative-ja',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-no-double-negative-ja'))
            .default,
        ),
        options: true,
      },
      {
        ruleId: 'no-hankaku-kana',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-no-hankaku-kana')).default,
        ),
        options: true,
      },
      {
        ruleId: 'ja-no-redundant-expression',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-ja-no-redundant-expression'))
            .default,
        ),
        options: true,
      },
      {
        ruleId: 'ja-no-abusage',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-ja-no-abusage')).default,
        ),
        options: true,
      },
      {
        ruleId: 'no-mixed-zenkaku-and-hankaku-alphabet',
        rule: moduleInterop(
          (
            await import(
              // @ts-expect-error
              'textlint-rule-no-mixed-zenkaku-and-hankaku-alphabet'
            )
          ).default,
        ),
        options: true,
      },
      {
        ruleId: 'no-dropping-the-ra',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-no-dropping-the-ra')).default,
        ),
        options: true,
      },
      {
        ruleId: 'no-doubled-conjunction',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-no-doubled-conjunction'))
            .default,
        ),
        options: true,
      },
      {
        ruleId: 'ja-no-mixed-period',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-ja-no-mixed-period')).default,
        ),
        options: {
          allowEmojiAtEnd: true,
        },
      },
      {
        ruleId: 'ja-hiragana-keishikimeishi',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-ja-hiragana-keishikimeishi'))
            .default,
        ),
        options: true,
      },
      {
        ruleId: 'ja-hiragana-fukushi',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-ja-hiragana-fukushi')).default,
        ),
        options: true,
      },
      {
        ruleId: 'ja-hiragana-hojodoushi',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-ja-hiragana-hojodoushi'))
            .default,
        ),
        options: true,
      },
      {
        ruleId: '@textlint-ja/textlint-rule-no-insert-dropping-sa',
        rule: moduleInterop(
          (
            await import(
              // @ts-expect-error
              '@textlint-ja/textlint-rule-no-insert-dropping-sa'
            )
          ).default,
        ),
        options: true,
      },
      {
        ruleId: '@textlint-ja/no-synonyms',
        rule: moduleInterop(
          (await import('@textlint-ja/textlint-rule-no-synonyms'))
            .default,
        ),
        options: true,
      },
      {
        ruleId: 'ja-no-orthographic-variants',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-ja-no-orthographic-variants'))
            .default,
        ),
        options: true,
      },
      {
        ruleId: 'general-novel-style-ja',
        rule: moduleInterop(
          // @ts-expect-error
          (await import('textlint-rule-general-novel-style-ja'))
            .default,
        ),
        options: true,
      },
    ],
    plugins: [
      {
        plugin: moduleInterop(
          (await import('@textlint/textlint-plugin-markdown'))
            .default,
        ),
        pluginId: 'textlint-plugin-markdown',
      },
    ],
    filterRules: [],
  });
};
