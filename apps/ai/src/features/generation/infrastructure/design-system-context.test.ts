import {
  bgColorClasses,
  componentAllowlist,
  findUnknownArteImports,
  iconAllowlist,
  textColorClasses,
} from './design-system-context';

describe('design-system-context', () => {
  describe('正常系', () => {
    it('コンポーネント許可リストに主要コンポーネントを含む', () => {
      expect(componentAllowlist).toContain('Button');
      expect(componentAllowlist).toContain('Card');
      expect(componentAllowlist).toContain('Stack');
    });

    it('色クラスがセマンティックトークン由来で生成される', () => {
      expect(textColorClasses).toContain('text-fg-base');
      expect(bgColorClasses).toContain('bg-bg-surface');
    });

    it('アイコン許可リストに実在アイコンを含む', () => {
      expect(iconAllowlist).toContain('MailIcon');
      expect(iconAllowlist).toContain('SendIcon');
      expect(iconAllowlist).toContain('CheckIcon');
    });
  });

  describe('findUnknownArteImports', () => {
    describe('正常系', () => {
      it('実在する import のみなら空配列を返す', () => {
        const code = `import { Card, Heading, MailIcon } from '@k8o/arte-odyssey';
export default function Preview() { return <Card><Heading type="h2">x</Heading></Card>; }`;
        expect(findUnknownArteImports(code)).toStrictEqual([]);
      });

      it('`as` エイリアスは実体名で検証する', () => {
        const code = `import { Card as Panel } from '@k8o/arte-odyssey';`;
        expect(findUnknownArteImports(code)).toStrictEqual([]);
      });
    });

    describe('異常系', () => {
      it('存在しないアイコン名を検出する', () => {
        const code = `import { Card, BellIcon, ActivityIcon } from '@k8o/arte-odyssey';`;
        expect(findUnknownArteImports(code)).toStrictEqual([
          'BellIcon',
          'ActivityIcon',
        ]);
      });

      it('複数行 import でも検出する', () => {
        const code = `import {
  Card,
  HomeIcon,
} from '@k8o/arte-odyssey';`;
        expect(findUnknownArteImports(code)).toStrictEqual(['HomeIcon']);
      });
    });

    describe('エッジケース', () => {
      it('arte-odyssey 以外の import は無視する', () => {
        const code = `import { useState } from 'react';
import { Card } from '@k8o/arte-odyssey';`;
        expect(findUnknownArteImports(code)).toStrictEqual([]);
      });

      it('サブパス import は対象外（barrel のみ検証）', () => {
        const code = `import { tokens } from '@k8o/arte-odyssey/tokens';`;
        expect(findUnknownArteImports(code)).toStrictEqual([]);
      });
    });
  });
});
