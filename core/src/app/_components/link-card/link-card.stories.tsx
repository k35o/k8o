import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { mocked } from 'storybook/test';
import { LinkCard } from './link-card';
import { getMetadata } from './metadata';

const meta: Meta<typeof LinkCard> = {
  title: 'app/globals/link-card',
  component: LinkCard,
  beforeEach: () => {
    mocked(getMetadata).mockResolvedValue({
      title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
      description:
        'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
      image: 'k8o.jpg',
    });
  },
};

export default meta;
type Story = StoryObj<typeof LinkCard>;

export const Primary: Story = {
  args: {
    href: 'https://example.com',
  },
};

export const NoData: Story = {
  args: {
    href: 'https://example.com',
  },
  beforeEach: () => {
    mocked(getMetadata).mockResolvedValue({
      title: undefined,
      description: undefined,
      image: undefined,
    });
  },
};

export const NoTitle: Story = {
  args: {
    href: 'https://example.com',
  },
  beforeEach: () => {
    mocked(getMetadata).mockResolvedValue({
      title: undefined,
      description:
        'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
      image: 'k8o.jpg',
    });
  },
};

export const NoDescription: Story = {
  args: {
    href: 'https://example.com',
  },
  beforeEach: () => {
    mocked(getMetadata).mockResolvedValue({
      title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
      description: undefined,
      image: 'k8o.jpg',
    });
  },
};

export const NoImage: Story = {
  args: {
    href: 'https://example.com',
  },
  beforeEach: () => {
    mocked(getMetadata).mockResolvedValue({
      title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
      description:
        'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
      image: undefined,
    });
  },
};
