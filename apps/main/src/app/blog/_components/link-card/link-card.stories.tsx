import { mocked } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { LinkCard } from './link-card';
import { getMetadata } from './metadata';

const meta = preview.meta({
  title: 'app/blog/link-card',
  component: LinkCard,
  beforeEach: () => {
    mocked(getMetadata).mockResolvedValue({
      title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
      description:
        'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
      imageUrl: 'k8o.jpg',
    });
  },
});

export const Primary = meta.story({
  args: {
    href: 'https://example.com',
  },
});

export const NoData = meta.story({
  args: {
    href: 'https://example.com',
  },
  beforeEach: () => {
    mocked(getMetadata).mockResolvedValue({
      title: undefined,
      description: undefined,
      imageUrl: undefined,
    });
  },
});

export const NoTitle = meta.story({
  args: {
    href: 'https://example.com',
  },
  beforeEach: () => {
    mocked(getMetadata).mockResolvedValue({
      title: undefined,
      description:
        'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
      imageUrl: 'k8o.jpg',
    });
  },
});

export const NoDescription = meta.story({
  args: {
    href: 'https://example.com',
  },
  beforeEach: () => {
    mocked(getMetadata).mockResolvedValue({
      title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
      description: undefined,
      imageUrl: 'k8o.jpg',
    });
  },
});

export const NoImage = meta.story({
  args: {
    href: 'https://example.com',
  },
  beforeEach: () => {
    mocked(getMetadata).mockResolvedValue({
      title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
      description:
        'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
      imageUrl: undefined,
    });
  },
});

export const FetchFailure = meta.story({
  args: {
    href: 'https://example.com',
  },
  beforeEach: () => {
    mocked(getMetadata).mockRejectedValue(new Error('fetch failed'));
  },
});
