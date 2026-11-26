import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import type { ActivityItem } from '@/features/activity/interface/queries';
import type { BlogLink } from '@/features/blog/interface/queries';

import { ActivityFeed } from '../activity-feed/activity-feed';
import { BrowserOnly } from '../browser-only/browser-only';
import { EmailTooltip } from '../email-tooltip/email-tooltip';
import {
  HomeBaseline,
  HomeBaselineSkeleton,
} from '../home-baseline/home-baseline';
import {
  HomeReadings,
  HomeReadingsSkeleton,
} from '../home-readings/home-readings';
import { SocialIcons } from '../social-icons/social-icons';
import { HomeDailyPreload } from './home-daily-preload';
// 小さい版は data: URI になり、srcset に入れると HTML と preload とペイロードに埋まるので、ファイルで配る
import k8o128 from './k8o.128w.avif?no-inline';
import k8o256 from './k8o.256w.avif?no-inline';
import k8o from './k8o.avif';

import styles from './home.module.css';

const ACTIVITY_COUNT = 8;

type HomeProps = {
  // 新しい順
  activity: ActivityItem[];
  // web-features の機能の ID から、その機能を書いた記事を引く表
  featureBlogs: Record<string, BlogLink>;
};

export const Home: FC<HomeProps> = ({ activity, featureBlogs }) => (
  <div className={styles.root}>
    <HomeDailyPreload />
    <div className={styles.sections}>
      <header className={styles.header}>
        <img
          alt="k8oのアイコン"
          className={styles.avatar}
          fetchPriority="high"
          height={128}
          sizes="(width >= 64rem) 8rem, 4rem"
          src={k8o}
          srcSet={`${k8o128} 128w, ${k8o256} 256w, ${k8o} 512w`}
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

      <div className={styles.columns}>
        {/* 狭い幅では年表の上に並ぶので、フォーカスと読み上げの順もそれに合わせて年表より先に置く */}
        <div className={styles.daily}>
          <div className={styles.dailyItem}>
            <BrowserOnly fallback={<HomeReadingsSkeleton />}>
              <HomeReadings />
            </BrowserOnly>
          </div>
          <div className={styles.dailyItem}>
            <BrowserOnly fallback={<HomeBaselineSkeleton />}>
              <HomeBaseline
                articleSlugs={Object.fromEntries(
                  Object.entries(featureBlogs).map(([featureId, { slug }]) => [
                    featureId,
                    slug,
                  ]),
                )}
              />
            </BrowserOnly>
          </div>
        </div>

        <section className={styles.activity}>
          <h2 className={styles.activityHeading}>Activity</h2>
          <ActivityFeed items={activity.slice(0, ACTIVITY_COUNT)} />
        </section>
      </div>
    </div>
  </div>
);
