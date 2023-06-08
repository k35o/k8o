import Link from 'next/link';
import { FC, ReactNode } from 'react';

export const GlobalLayout: FC<{ children: ReactNode }> = ({
  children,
}) => {
  //　k8oというアプリのヘッダーをtailwindcssで作成する
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Link href="/">
            <h1 className="text-3xl font-bold">k8o</h1>
          </Link>
        </div>
      </header>
      <main className="flex grow justify-center bg-slate-300">
        <div className="w-full max-w-4xl px-4 py-10">{children}</div>
      </main>
    </div>
  );
};
