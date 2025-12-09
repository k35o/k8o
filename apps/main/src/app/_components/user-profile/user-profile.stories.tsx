import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { UserProfile } from './user-profile';

const meta: Meta<typeof UserProfile> = {
  title: 'app/globals/user-profile',
  component: UserProfile,
  decorators: [
    (Story) => (
      <div className="bg-bg-base p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UserProfile>;

export const Primary: Story = {
  args: {
    name: '山田太郎',
    email: 'taro.yamada@example.com',
    avatarUrl: 'https://via.placeholder.com/150',
    bio: 'フロントエンドエンジニアです。React と TypeScript が好きです。',
  },
};

export const WithoutAvatar: Story = {
  args: {
    name: '佐藤花子',
    email: 'hanako.sato@example.com',
    bio: 'バックエンドエンジニアとして働いています。',
  },
};

export const MinimalInfo: Story = {
  args: {
    name: '鈴木一郎',
  },
};

export const LongBio: Story = {
  args: {
    name: '田中次郎',
    email: 'jiro.tanaka@example.com',
    avatarUrl: 'https://via.placeholder.com/150',
    bio: 'ソフトウェアエンジニアとして10年以上の経験があります。特にフロントエンド開発とUI/UXデザインに情熱を持っています。最近はアクセシビリティとパフォーマンス最適化に力を入れています。',
  },
};
