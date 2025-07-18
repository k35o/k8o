import { Heading } from '@k8o/components/heading';
import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">Admin</Heading>
      {children}
    </div>
  );
}
