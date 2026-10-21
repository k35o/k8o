import { expect, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { MarkdownText } from './markdown-text';

const meta = preview.meta({
  component: MarkdownText,
});

export const Links = meta.story({
  args: {
    children: [
      '- [ハンドブック](https://www.typescriptlang.org/docs/)',
      '- [スキームの無いリンク](//evil.example/collect?d=1)',
      '- [国際化ドメイン](https://例え.jp/)',
      '- https://k8o.me/blog',
      '- https://\u0430pple.com/login?d=1',
      '- https://react.dev@attacker.example/?d=1',
      '- [作ったもの](/artifacts)',
      '- [メール](mailto:k8o@example.com)',
    ].join('\n'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const handbook = canvas.getByRole('link', { name: 'ハンドブック' });
    await expect(handbook).toHaveAttribute(
      'href',
      'https://www.typescriptlang.org/docs/',
    );
    await expect(handbook).toHaveAttribute('target', '_blank');
    await expect(handbook).toHaveAttribute('rel', 'noopener noreferrer');
    // 行き先のホストは、リンクの名前を変えないよう外側に添える
    const handbookHost = canvas.getByText('（www.typescriptlang.org）');
    await expect(handbook).not.toContainElement(handbookHost);

    // // で始まるリンクも外へのリンクとして、別のタブで開く
    const protocolRelative = canvas.getByRole('link', {
      name: 'スキームの無いリンク',
    });
    await expect(protocolRelative).toHaveAttribute(
      'href',
      'https://evil.example/collect?d=1',
    );
    await expect(protocolRelative).toHaveAttribute('target', '_blank');
    await expect(protocolRelative).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    await expect(canvas.getByText('（evil.example）')).toBeInTheDocument();

    // 見た目の似た字のホストに気づけるよう、国際化ドメインは punycode で添える
    await expect(canvas.getByText('（xn--r8jz45g.jp）')).toBeInTheDocument();

    // リンクの文字が行き先のオリジンから始まる URL そのものなら、ホストは見えているので添えない
    await expect(
      canvas.getByRole('link', { name: 'https://k8o.me/blog' }),
    ).toHaveAttribute('target', '_blank');
    await expect(canvas.queryByText('（k8o.me）')).not.toBeInTheDocument();

    // 素の URL でも、見た目の似た字（キリル文字の а）の国際化ドメインと、userinfo で別のホストを先に見せる URL には添える
    await expect(
      canvas.getByRole('link', { name: 'https://\u0430pple.com/login?d=1' }),
    ).toHaveAttribute('href', 'https://xn--pple-43d.com/login?d=1');
    await expect(canvas.getByText('（xn--pple-43d.com）')).toBeInTheDocument();
    await expect(canvas.getByText('（attacker.example）')).toBeInTheDocument();

    // 内のリンクと http(s) でないリンクは、ホストを添えずに同じタブで開く
    const internal = canvas.getByRole('link', { name: '作ったもの' });
    await expect(internal).toHaveAttribute('href', '/artifacts');
    await expect(internal).not.toHaveAttribute('target');
    const mail = canvas.getByRole('link', { name: 'メール' });
    await expect(mail).toHaveAttribute('href', 'mailto:k8o@example.com');
    await expect(mail).not.toHaveAttribute('target');
    await expect(canvas.getAllByText(/^（.+）$/u)).toHaveLength(5);
  },
});
