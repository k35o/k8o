import { Heading, Separator } from '@k8ordo/ui';
import type { Metadata } from 'next';
import Image from 'next/image';

import { getBlogContents } from '@/features/blog/interface/queries';

import { EmailTooltip } from './_components/email-tooltip';
import { HomeJsonLd } from './_components/json-ld';
import { RecentBlogs } from './_components/recent-blogs';
import { SiteEntrySection } from './_components/site-entry-section';
import { SocialIcons } from './_components/social-icons';
import k8o from './_images/k8o.jpg';

import styles from './page.module.css';

export const metadata = {
  alternates: {
    canonical: '/',
  },
} satisfies Metadata;

export default async function Home() {
  const blogs = await getBlogContents();

  return (
    <div className={styles.root}>
      <HomeJsonLd />
      <div className={styles.sections}>
        <header className={styles.header}>
          <Image
            alt="k8oのアイコン"
            className={styles.avatar}
            height={128}
            src={k8o}
            width={128}
          />
          <div className={styles.identity}>
            <Heading level="h1">k8o</Heading>
            <div className={styles.contacts}>
              <SocialIcons />
              <EmailTooltip />
            </div>
          </div>

          <p className={styles.intro}>
            Webフロントエンドを軸足に、最近は新しくブラウザで使えるようになった機能の深掘りをブログに残しています。
            デザインとの境界にも興味があり、デザインシステム@k8ordo/uiを育てています。
          </p>
        </header>

        <Separator color="subtle" />

        <div className={styles.activity}>
          <div>
            <Heading level="h2">Activity</Heading>
            <p className={styles.activityLead}>最近の発信の記録。</p>
          </div>
          <RecentBlogs blogs={blogs.slice(0, 3)} />
        </div>

        <SiteEntrySection kind="reading" />
        <SiteEntrySection kind="tool" />
      </div>
    </div>
  );
}
