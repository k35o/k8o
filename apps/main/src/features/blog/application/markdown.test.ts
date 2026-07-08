import { mdxToMarkdown } from './markdown';

describe('mdxToMarkdown', () => {
  describe('正常系', () => {
    it('frontmatterとimport文を取り除く', () => {
      const source = [
        '---',
        'title: タイトル',
        '---',
        '',
        "import { BaselineStatus } from '@k8o/arte-odyssey';",
        "import { Playground } from '@/app/_components/playgrounds';",
        '',
        '# 見出し',
        '',
        '本文です。',
      ].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe(
        ['# 見出し', '', '本文です。', ''].join('\n'),
      );
    });

    it('LinkCardをオートリンクへ変換する', () => {
      const source = '<LinkCard href="https://example.com/page" />\n';

      expect(mdxToMarkdown(source, 'sample')).toBe(
        '<https://example.com/page>\n',
      );
    });

    it('LinkCardの相対hrefはサイトURLを前置する', () => {
      const source = '<LinkCard href="/blog/other-article" />\n';

      expect(mdxToMarkdown(source, 'sample')).toBe(
        '<https://k8o.me/blog/other-article>\n',
      );
    });

    it('PlaygroundをWeb版への案内に置き換える', () => {
      const source = [
        '<Playground title="デモのタイトル">',
        '  <Demo />',
        '</Playground>',
      ].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe(
        '> インタラクティブデモ「デモのタイトル」はWeb版で試せます: <https://k8o.me/blog/sample>\n',
      );
    });

    it('titleのないPlaygroundも案内に置き換える', () => {
      const source = '<Playground>\n  <Demo />\n</Playground>\n';

      expect(mdxToMarkdown(source, 'sample')).toBe(
        '> インタラクティブデモはWeb版で試せます: <https://k8o.me/blog/sample>\n',
      );
    });

    it('Imageをalt文の注記に置き換える', () => {
      const source = [
        "import monitor from './monitor.png';",
        '',
        '<Image src={monitor} alt="アクティビティモニタの画面" />',
      ].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe(
        '（画像: アクティビティモニタの画面）\n',
      );
    });

    it('BaselineStatusを削除して前後の空行を詰める', () => {
      const source = [
        '# 見出し',
        '',
        '<BaselineStatus featureId="feature"></BaselineStatus>',
        '',
        '本文です。',
      ].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe(
        ['# 見出し', '', '本文です。', ''].join('\n'),
      );
    });

    it('Alertをmessageの引用に置き換える', () => {
      const source = '<Alert tone="warning" message="注意してください。" />\n';

      expect(mdxToMarkdown(source, 'sample')).toBe('> 注意してください。\n');
    });

    it('コードブロック内の注釈ディレクティブを整理する', () => {
      const source = [
        '```css',
        '/* [!og] */',
        '.button {',
        '  /* [!callout: 背景色から文字色を導出する] */',
        '  color: contrast-color(lightblue);',
        '}',
        '```',
      ].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe(
        [
          '```css',
          '.button {',
          '  /* 背景色から文字色を導出する */',
          '  color: contrast-color(lightblue);',
          '}',
          '```',
          '',
        ].join('\n'),
      );
    });
  });

  describe('エッジケース', () => {
    it('コードブロック内のimport文やJSXには触れない', () => {
      const source = [
        '```tsx',
        "import { useState } from 'react';",
        '',
        'const App = () => <Playground title="デモ" />;',
        '```',
      ].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe(`${source}\n`);
    });

    it('MDXのコメント式を削除する', () => {
      const source = ['{/* TODO: あとで直す */}', '', '本文です。'].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe('本文です。\n');
    });

    it('未知のコンポーネントは子要素だけ残す', () => {
      const source = ['<Wrapper>', '本文です。', '</Wrapper>'].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe('本文です。\n');
    });

    it('子のない未知のコンポーネントは削除する', () => {
      const source = ['<CustomDemo />', '', '本文です。'].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe('本文です。\n');
    });

    it('小文字のHTMLタグは残しつつ中のJSXは変換する', () => {
      const source = [
        '<figure>',
        '  <LinkCard href="https://example.com" />',
        '</figure>',
      ].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe(
        ['<figure>', '  <https://example.com>', '</figure>', ''].join('\n'),
      );
    });

    it('数式ブロックや通常のmarkdownは原文のまま保つ', () => {
      const source = [
        '## 見出し',
        '',
        '`inline code`と**強調**、$L$ のような数式。',
        '',
        '```math',
        'C_b = \\frac{L + 0.05}{0.05}',
        '```',
        '',
        '- リスト1',
        '- リスト2',
      ].join('\n');

      expect(mdxToMarkdown(source, 'sample')).toBe(`${source}\n`);
    });
  });
});
