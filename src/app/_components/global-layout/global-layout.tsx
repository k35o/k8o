import Link from 'next/link';
import { FC, ReactNode } from 'react';
import { Heading } from '../heading';

export const GlobalLayout: FC<{ children: ReactNode }> = ({
  children,
}) => {
  //　k8oというアプリのヘッダーをtailwindcssで作成する
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Link href="/">
            <Heading type="h1">k8o</Heading>
          </Link>
        </div>
      </header>
      <main className="flex grow justify-center bg-slate-300">
        <div className="w-full max-w-4xl px-4 py-10">{children}</div>
      </main>
    </div>
  );
};
