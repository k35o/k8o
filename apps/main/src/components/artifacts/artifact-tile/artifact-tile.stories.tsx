import { expect } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import type { Artifact } from '../artifacts/artifacts';
import { ArtifactTile } from './artifact-tile';

const vrt: Artifact = {
  name: 'storybook-addon-vrt',
  description:
    'Vitestのブラウザモード上でStorybookのストーリーごとにスクリーンショットを撮り、ビジュアルリグレッションテストを行うツール。',
  group: 'storybook',
  icon: 'image',
  githubUrl: 'https://github.com/k35o/storybook-addon-vrt',
  websiteUrl: null,
  npmPackageName: 'storybook-addon-vrt',
};

const dotfiles: Artifact = {
  name: 'dotfiles',
  description:
    'chezmoiで管理する、macOSの開発環境の設定一式。zshやgit、mise、Claude Codeの設定をまとめている。',
  group: 'config',
  icon: 'monitor',
  githubUrl: 'https://github.com/k35o/dotfiles',
  websiteUrl: null,
  npmPackageName: null,
};

const k8ordo: Artifact = {
  name: 'k8ordo',
  description:
    'Baselineに入った機能を待たずに使う、Reactのライブラリ群。UIコンポーネント、フレームワーク、ルーター、状態、フォームなど7つのパッケージからなる。',
  group: 'k8ordo',
  icon: 'jellyfish',
  githubUrl: 'https://github.com/k35o/k8ordo',
  websiteUrl: 'https://ordo.k8o.me/ja/',
  npmPackageName: '@k8ordo/ui',
};

const meta = preview.meta({
  title: 'app/artifacts/artifact-tile',
  component: ArtifactTile,
  args: {
    artifact: vrt,
    release: { version: '0.4.2', publishedAt: '2026-10-29T03:00:00.000Z' },
  },
});

export const Primary = meta.story({
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'storybook-addon-vrt' }),
    ).toHaveAttribute('href', 'https://github.com/k35o/storybook-addon-vrt');
    await expect(canvas.getByText('v0.4.2')).toBeVisible();
    await expect(canvas.getByText('2026年10月29日')).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'storybook-addon-vrt の npm' }),
    ).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/storybook-addon-vrt',
    );
  },
});

// npm に出していないものは、版も npm へのリンクも出さない
export const WithoutNpm = meta.story({
  args: {
    artifact: dotfiles,
    release: null,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
    await expect(canvas.queryByRole('time')).toBeNull();
  },
});

// サイトを持つものは、名前のリンクがサイトへ向く
export const Featured = meta.story({
  args: {
    artifact: k8ordo,
    release: { version: '3.0.0', publishedAt: '2026-11-13T02:00:00.000Z' },
    featured: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'k8ordo' })).toHaveAttribute(
      'href',
      'https://ordo.k8o.me/ja/',
    );
  },
});
