import type { Spec } from '@json-render/core';

import { specToTsx } from './spec-to-tsx';

describe('specToTsx', () => {
  describe('正常系', () => {
    it('Stack / Card / Heading / FormControl / Button を実 API の TSX へ変換する', () => {
      const spec: Spec = {
        root: 'page',
        elements: {
          page: {
            type: 'Stack',
            props: { direction: 'column', gap: 'lg' },
            children: ['title', 'card'],
          },
          title: {
            type: 'Heading',
            props: { level: 'h2', text: 'お問い合わせ' },
          },
          card: {
            type: 'Card',
            props: { appearance: 'shadow', size: 'lg' },
            children: ['name', 'submit'],
          },
          name: {
            type: 'FormControl',
            props: { label: 'お名前', name: 'name', required: true },
          },
          submit: {
            type: 'Button',
            props: { label: '送信する', color: 'primary', variant: 'solid' },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx)
        .toBe(`import { Button, Card, FormControl, Heading, Stack, TextField } from '@k8o/arte-odyssey';

export default function Preview() {
  return (
    <Stack direction="column" gap="lg">
      <Heading type="h2">お問い合わせ</Heading>
      <Card appearance="shadow">
        <div className="p-8">
          <FormControl label="お名前" required
            renderInput={(props) => (
              <TextField {...props} name="name" />
            )}
          />
          <Button color="primary" variant="solid">送信する</Button>
        </div>
      </Card>
    </Stack>
  );
}
`);
    });

    it('href 付き Button は renderItem のリンクとして展開する', () => {
      const spec: Spec = {
        root: 'b',
        elements: {
          b: {
            type: 'Button',
            props: { label: '詳細を見る', href: 'https://k8o.me' },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('renderItem={({ className, children }) => (');
      expect(tsx).toContain('<a className={className} href="https://k8o.me">');
    });

    it('Icon は実在するアイコンコンポーネントへ対応させて import する', () => {
      const spec: Spec = {
        root: 'i',
        elements: {
          i: { type: 'Icon', props: { name: 'external-link', size: 'sm' } },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('<ExternalLinkIcon size="sm" />');
      expect(tsx).toContain(
        "import { ExternalLinkIcon } from '@k8o/arte-odyssey';",
      );
    });
  });

  describe('異常系', () => {
    it('動的値（$state）の prop は省略して NOTE を残す', () => {
      const spec: Spec = {
        root: 'h',
        elements: {
          h: {
            type: 'Heading',
            props: { text: { $state: '/title' }, level: 'h3' },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('// NOTE:');
      expect(tsx).toContain('$state');
      expect(tsx).not.toContain('$state: ');
    });

    it('未対応の複合コンポーネントは TODO コメントにして props を残す', () => {
      const spec: Spec = {
        root: 't',
        elements: {
          t: {
            type: 'Table',
            props: { columns: ['a'], rows: [['1']] },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('{/* TODO: Table props=');
      expect(tsx).toContain('// NOTE: Table は手動で移植すること。');
    });
  });

  describe('エッジケース', () => {
    it('root が elements に無い場合も壊れず骨組みだけ出力する', () => {
      const spec: Spec = { root: 'missing', elements: {} };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('export default function Preview()');
    });
  });
});
