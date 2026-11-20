import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import type { ActivityItem } from '@/features/activity/interface/queries';

import { ActivityFeed } from '../activity-feed/activity-feed';
import { EmailTooltip } from '../email-tooltip/email-tooltip';
import { SocialIcons } from '../social-icons/social-icons';
// 小さい版は data: URI になり、srcset に入れると HTML と preload とペイロードに埋まるので、ファイルで配る
import k8o128 from './k8o.128w.avif?no-inline';
import k8o256 from './k8o.256w.avif?no-inline';
import k8o from './k8o.avif';

import styles from './home.module.css';

const ACTIVITY_COUNT = 8;

type HomeProps = {
  // 新しい順
  activity: ActivityItem[];
};

export const Home: FC<HomeProps> = ({ activity }) => (
  <div className={styles.root}>
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

      <section>
        <h2 className={styles.activityHeading}>Activity</h2>
        <ActivityFeed items={activity.slice(0, ACTIVITY_COUNT)} />
      </section>
    </div>
  </div>
);
