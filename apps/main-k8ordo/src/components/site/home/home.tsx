import { Heading, Separator } from '@k8ordo/ui';
import type { FC } from 'react';

import type { getBlogContents } from '@/features/blog/interface/queries';

import { EmailTooltip } from '../email-tooltip/email-tooltip';
import { RecentBlogs } from '../recent-blogs/recent-blogs';
import { SiteEntrySection } from '../site-entry-section/site-entry-section';
import { SocialIcons } from '../social-icons/social-icons';
import k8o from './k8o.avif';

import styles from './home.module.css';

type HomeProps = {
  blogs: Awaited<ReturnType<typeof getBlogContents>>;
};

export const Home: FC<HomeProps> = ({ blogs }) => (
  <div className={styles.root}>
    <div className={styles.sections}>
      <header className={styles.header}>
        <img
          alt="k8oのアイコン"
          className={styles.avatar}
          fetchPriority="high"
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
