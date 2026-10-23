'use client';

import { Anchor, Button } from '@k8ordo/ui';
import Link from 'next/link';

import notFoundImage from './_images/404.avif';

import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.root}>
      <img
        alt="404 Not Found"
        height={720}
        src={notFoundImage.src}
        width={1280}
      />
      <Button
        // next/link は onClick や ref に明示的な undefined を受けない
        // (exactOptionalPropertyTypes) ため、束は展開せず要るものだけ取り出す
        renderItem={({ className, children }) => (
          <Link className={className} href="/">
            {children}
          </Link>
        )}
        size="lg"
      >
        トップへ戻る
      </Button>
      <p className={styles.otherLinks}>
        <Anchor href="/blog">ブログ一覧</Anchor>・
        <Anchor href="/sitemap.xml">サイトマップ</Anchor>・
        <Anchor href="/llms.txt">llms.txt</Anchor>
        からも探せます。
      </p>
    </div>
  );
}
