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

// TODO: 適当なのでちゃんと組む
// 間違えて送っちゃた時のことなど
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
          <Container className="mx-auto my-[40px] rounded-xl bg-white text-[#18181b]">
            <Heading className="text-fg-base text-center text-2xl font-bold">
              k8o.meへのメールアドレス確認
            </Heading>
            <div>
              <Text className="m-0 text-center text-base font-normal">
                {formatDate(expiresAt, 'yyyy年M月d日(E) HH時mm分')}
                までに
              </Text>
              <Text className="m-0 text-center text-base font-normal">
                下記のリンクをクリックしてください
              </Text>
            </div>
            <Link
              href={`https://k8o.me/api/verify?email=${email}&token=${token}`}
              className="m-4 block rounded-lg bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
            >
              メールアドレスを確認する
            </Link>
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
