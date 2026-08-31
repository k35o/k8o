'use client';

import { Anchor, Button } from '@k8ordo/ui';
import Image from 'next/image';
import Link from 'next/link';

import notFoundImage from './_images/404.png';

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <Image alt="404 Not Found" src={notFoundImage} />
      <Button
        renderItem={({ className, children }) => (
          <Link className={className} href="/">
            {children}
          </Link>
        )}
        size="lg"
      >
        トップへ戻る
      </Button>
      <p className="text-fg-mute text-sm">
        <Anchor href="/blog">ブログ一覧</Anchor>・
        <Anchor href="/sitemap.xml">サイトマップ</Anchor>・
        <Anchor href="/llms.txt">llms.txt</Anchor>
        からも探せます。
      </p>
    </div>
  );
}
