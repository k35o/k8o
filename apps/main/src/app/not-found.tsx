'use client';

import { Button } from '@k8o/arte-odyssey';
import Image from 'next/image';
import Link from 'next/link';

import notFoundImage from './_images/404.png';

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
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
    </div>
  );
}
