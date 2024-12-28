import { Heading } from '../../components/heading';
import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Heading type="h2">お知らせ</Heading>
      {children}
    </div>
  );
}
