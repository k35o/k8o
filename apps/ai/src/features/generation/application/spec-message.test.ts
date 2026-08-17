import { SPEC_DATA_PART_TYPE } from '@json-render/core';
import type { JsonPatch, Spec } from '@json-render/core';
import type { UIMessage } from 'ai';

import {
  countElements,
  hasSpecParts,
  parseSpecProse,
  specFromMessage,
  usedComponentTypes,
} from './spec-message';

const patchPart = (patch: JsonPatch): UIMessage['parts'][number] => ({
  type: SPEC_DATA_PART_TYPE,
  data: { type: 'patch', patch },
});

const message = (parts: UIMessage['parts']): UIMessage => ({
  id: 'm',
  role: 'assistant',
  parts,
});

describe('specFromMessage', () => {
  describe('正常系', () => {
    it('パッチを順に適用して spec を組み立てる', () => {
      const built = specFromMessage(
        message([
          patchPart({ op: 'add', path: '/root', value: 'a' }),
          patchPart({
            op: 'add',
            path: '/elements',
            value: { a: { type: 'Button', props: { label: 'OK' } } },
          }),
        ]),
        null,
      );
      expect(built).toStrictEqual({
        root: 'a',
        elements: { a: { type: 'Button', props: { label: 'OK' } } },
      });
    });

    it('base がある場合は base を土台に編集し、base 自体は変更しない', () => {
      const base: Spec = {
        root: 'a',
        elements: { a: { type: 'Button', props: { label: 'OK' } } },
      };
      const built = specFromMessage(
        message([
          patchPart({
            op: 'replace',
            path: '/elements/a/props/label',
            value: 'NG',
          }),
        ]),
        base,
      );
      expect(built).toStrictEqual({
        root: 'a',
        elements: { a: { type: 'Button', props: { label: 'NG' } } },
      });
      // base 自体は変更されていない。
      expect(base).toStrictEqual({
        root: 'a',
        elements: { a: { type: 'Button', props: { label: 'OK' } } },
      });
    });
  });

  describe('異常系', () => {
    it('spec パーツが無い（会話だけの応答）は null', () => {
      expect(
        specFromMessage(message([{ type: 'text', text: 'こんにちは' }]), null),
      ).toBeNull();
    });

    it('適用できないパッチは無視して残りを適用する', () => {
      const built = specFromMessage(
        message([
          patchPart({ op: 'replace', path: '/elements/none/props', value: {} }),
          patchPart({ op: 'add', path: '/root', value: 'a' }),
          patchPart({
            op: 'add',
            path: '/elements',
            value: { a: { type: 'Badge', props: { text: 'ok' } } },
          }),
        ]),
        null,
      );
      expect(built?.root).toBe('a');
    });
  });

  describe('エッジケース', () => {
    it('root だけで elements が無い途中状態は null', () => {
      expect(
        specFromMessage(
          message([patchPart({ op: 'add', path: '/root', value: 'a' })]),
          null,
        ),
      ).toBeNull();
    });
  });
});

describe('hasSpecParts', () => {
  describe('正常系', () => {
    it('spec パーツを含むメッセージは true（組み上げ失敗と会話応答を区別できる）', () => {
      const failed = message([
        patchPart({ op: 'replace', path: '/elements/none', value: {} }),
      ]);
      expect(hasSpecParts(failed)).toBe(true);
      expect(specFromMessage(failed, null)).toBeNull();
    });

    it('テキストだけのメッセージは false', () => {
      expect(
        hasSpecParts(message([{ type: 'text', text: 'こんにちは' }])),
      ).toBe(false);
    });
  });
});

describe('parseSpecProse', () => {
  describe('正常系', () => {
    it('タイトル行と説明文を分離する', () => {
      expect(
        parseSpecProse('タイトル: 料金表\n3プランのカードを作りました。'),
      ).toStrictEqual({
        title: '料金表',
        description: '3プランのカードを作りました。',
      });
    });

    it('全角コロンも受け付ける', () => {
      expect(parseSpecProse('タイトル：問い合わせ\n説明')).toStrictEqual({
        title: '問い合わせ',
        description: '説明',
      });
    });
  });

  describe('異常系', () => {
    it('タイトル行が無ければ全文を説明として返す', () => {
      expect(parseSpecProse('できました。')).toStrictEqual({
        title: null,
        description: 'できました。',
      });
    });
  });

  describe('エッジケース', () => {
    it('空文字はタイトルなし・説明空', () => {
      expect(parseSpecProse('')).toStrictEqual({
        title: null,
        description: '',
      });
    });
  });
});

describe('usedComponentTypes / countElements', () => {
  describe('正常系', () => {
    it('要素の型を重複なしで列挙し、要素数を数える', () => {
      const spec: Spec = {
        root: 'a',
        elements: {
          a: { type: 'Stack', props: {}, children: ['b', 'c'] },
          b: { type: 'Button', props: { label: '1' } },
          c: { type: 'Button', props: { label: '2' } },
        },
      };
      expect(usedComponentTypes(spec)).toStrictEqual(['Stack', 'Button']);
      expect(countElements(spec)).toBe(3);
    });
  });

  describe('エッジケース', () => {
    it('null の spec は 0 要素', () => {
      expect(countElements(null)).toBe(0);
    });
  });
});
