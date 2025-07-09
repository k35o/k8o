import { formatDate } from '@k8o/helpers/date';
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

type Props = {
  email: string;
  token: string;
  expiresAt: Date;
};

const VerifyEmail = ({ email, token, expiresAt }: Props) => {
  return (
    <Html>
      <Head />
      <Preview>メールアドレス確認のお願い</Preview>
      <Tailwind>
        <Body
          className="m-auto p-[16px]"
          style={{
            backgroundImage:
              'linear-gradient(62deg, #ccfbf1 0%, #cffafe 100%)',
          }}
        >
          <Container className="mx-auto my-[40px] rounded-xl bg-white p-[16px] text-[#18181b]">
            <Heading className="text-fg-base text-center text-2xl font-bold">
              【k8o.me】購読確認メール
            </Heading>
            <Text className="m-0 text-base font-normal">
              ブログの購読を登録いただきありがとうございます。
            </Text>
            <Text className="m-0 text-base font-normal">
              以下のリンクをクリックすることで手続きが完了します。
            </Text>
            <Link
              href={`${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${process.env.VERCEL_URL ?? 'www.k8o.me'}/api/subscriptions/verify?email=${encodeURIComponent(email)}&token=${token}`}
              className="m-4 mb-1 block rounded-lg bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
            >
              購読を確認する
            </Link>
            <Text className="mx-4 my-0 text-sm text-[#3f3f46]">
              ※このリンクの有効期限は
              {formatDate(expiresAt, 'yyyy年M月d日(E) HH時mm分')}
              です。
            </Text>
            <Text className="mx-4 my-0 text-sm text-[#3f3f46]">
              ※期限を過ぎた場合は、お手数ですが再度ご登録の程お願いいたします。
            </Text>
            <Text className="text-sm">
              このメールに覚えがない場合は、破棄してください。
            </Text>
            <Text className="text-sm">
              お問い合わせは、このメールにご返信ください。
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VerifyEmail.PreviewProps = {
  email: 'k8o@k8o.me',
  token: 'token',
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
} satisfies Props;

export default VerifyEmail;
