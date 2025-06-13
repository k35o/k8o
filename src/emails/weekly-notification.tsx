import { formatDate } from '@/helpers/date/format';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Tailwind,
  Link,
} from '@react-email/components';

export type Notification = {
  id: number;
  type: 'comment';
  message: string | null;
  blog: {
    title: string;
    link: `https://www.k8o.me/blog/${string}`;
  } | null;
  feedback: {
    id: number;
    name: string;
  } | null;
  createdAt: Date;
};

type Props = {
  notifications: Notification[];
};

const WeeklyNotification = ({ notifications }: Props) => {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 6);
  return (
    <Html>
      <Head />
      <Preview>週次レポート</Preview>
      <Tailwind>
        <Body
          className="m-auto p-[16px]"
          style={{
            backgroundImage:
              'linear-gradient(62deg, #ccfbf1 0%, #cffafe 100%)',
          }}
        >
          <Container className="mx-auto my-[40px] rounded-xl bg-white text-[#18181b]">
            <Heading className="text-fg-base text-center text-2xl font-bold">
              週次レポート
            </Heading>
            <Text className="mb-0 text-center text-base font-normal">
              期間: {formatDate(oneWeekAgo)}〜{formatDate(now)}
            </Text>
            <div className="p-[32px]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="mb-[24px] rounded-md border border-solid border-[#a1a1aa] p-[12px]"
                >
                  <Text className="mt-0 mb-[16px] text-xl font-bold">
                    お問い合わせ通知
                    {notification.feedback && (
                      <span className="ml-[2px] rounded-full border border-solid border-[#a1a1aa] bg-[#f0f0f0] px-[12px] py-[4px] text-sm font-normal">
                        {notification.feedback.name}
                      </span>
                    )}
                  </Text>
                  {notification.message && (
                    <div className="mb-[8px]">
                      <Text className="m-0 text-[#3f3f46]">
                        お問い合わせ内容:
                      </Text>
                      <Text className="m-0">
                        {notification.message}
                      </Text>
                    </div>
                  )}
                  {notification.blog && (
                    <div className="mb-[8px]">
                      <Text className="m-0 text-[#3f3f46]">
                        関連ブログ:
                      </Text>
                      <div className="flex items-end gap-[2px]">
                        <Link href={notification.blog.link}>
                          {notification.blog.title}
                        </Link>
                      </div>
                    </div>
                  )}
                  <div>
                    <Text className="m-0 text-[#3f3f46]">
                      お問い合わせ日時:
                    </Text>
                    <Text className="m-0">
                      {formatDate(notification.createdAt)}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

WeeklyNotification.PreviewProps = {
  notifications: [
    {
      id: 1,
      type: 'comment',
      message: 'テストメッセージ',
      blog: {
        title: 'テストブログ',
        link: 'https://www.k8o.me/blog/test',
      },
      feedback: {
        id: 1,
        name: 'テストフィードバック',
      },
      createdAt: new Date(),
    },
    {
      id: 2,
      type: 'comment',
      message: null,
      blog: {
        title: 'テストブログ',
        link: 'https://www.k8o.me/blog/test',
      },
      feedback: {
        id: 1,
        name: 'テストフィードバック',
      },
      createdAt: new Date(),
    },
    {
      id: 3,
      type: 'comment',
      message: 'テストメッセージ',
      blog: null,
      feedback: null,
      createdAt: new Date(),
    },
    {
      id: 4,
      type: 'comment',
      message: null,
      blog: null,
      feedback: {
        id: 1,
        name: 'テストフィードバック',
      },
      createdAt: new Date(),
    },
  ],
} satisfies Props;

export default WeeklyNotification;
