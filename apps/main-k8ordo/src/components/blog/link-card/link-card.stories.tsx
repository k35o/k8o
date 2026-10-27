import { expect, waitFor } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { LinkCardView } from './link-card-view';

const title = 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ';
const description =
  'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。';
const imageUrl = 'k8o.jpg';

const meta = preview.meta({
  title: 'app/blog/link-card',
  component: LinkCardView,
  args: {
    href: 'https://example.com',
    metadata: { title, description, imageUrl },
  },
});

export const Primary = meta.story();

export const NoData = meta.story({
  args: {
    metadata: {},
  },
});

export const NoTitle = meta.story({
  args: {
    metadata: { description, imageUrl },
  },
});

export const NoDescription = meta.story({
  args: {
    metadata: { title, imageUrl },
  },
});

export const NoImage = meta.story({
  args: {
    metadata: { title, description },
  },
});

export const BrokenImage = meta.story({
  args: {
    metadata: { title, description, imageUrl: '/link-card-missing-image.png' },
  },
  play: async ({ canvas, canvasElement }) => {
    // 読み込めない画像は、画像の枠ごと消してテキストだけのカードにする
    await waitFor(async () => {
      await expect(canvasElement.querySelector('img')).toBeNull();
    });
    await expect(canvas.getByText(title)).toBeInTheDocument();
  },
});
