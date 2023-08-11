import { Heading } from '../_components/heading';

export const metadata = {
  title: 'What am I?',
  description: 'このアプリの制作者の紹介します。',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">What am I ?</Heading>
      {children}
    </div>
  );
}
