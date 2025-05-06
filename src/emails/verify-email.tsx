import { formatDate } from '@/utils/date/format';
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
      <Preview>メールアドレスの確認</Preview>
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
              k8o.meを購読いただきありがとうございます
            </Heading>
            <Text className="m-0 text-center text-base font-normal">
              メールアドレスの確認を行うため、下記のリンクをクリックしてください
            </Text>
            <Link
              href={`${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${process.env.VERCEL_URL ?? 'www.k8o.me'}/api/subscriptions/verify?email=${encodeURIComponent(email)}&token=${token}`}
              className="m-4 mb-1 block rounded-lg bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
            >
              メールアドレスを確認する
            </Link>
            <Text className="mx-4 my-0 text-sm text-[#3f3f46]">
              ※このリンクの有効期限は
              {formatDate(expiresAt, 'yyyy年M月d日(E) HH時mm分')}
              です。
            </Text>
            <Text className="mx-4 my-0 text-sm text-[#3f3f46]">
              ※期限を過ぎた場合は、お手数ですが再度ご登録をお願いいたします。
            </Text>
            <Text className="text-center">
              このメールにお心当たりがない場合は、誤って送信された可能性があります。
              <br />
              その際はお手数ですが、このメールを破棄してください。
            </Text>
            <Text className="text-center">
              ご不明点がありましたら、このメールに返信する形でお問い合わせください
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
