import {
  CalendarIcon,
  ImageIcon,
  MonitorIcon,
  PackageIcon,
  PaintBucketIcon,
  RefreshIcon,
  RocketIcon,
  SearchIcon,
  SettingsIcon,
} from '@k8ordo/ui/icons';
import type { BaseIconProps } from '@k8ordo/ui/icons';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { GitHubIcon } from '@/components/site/brand-icons/github-icon';
import type { LatestRelease } from '@/features/activity/interface/queries';

import {
  ClipboardCheckIcon,
  DiceIcon,
  FlameIcon,
  JellyfishIcon,
  PullRequestIcon,
} from '../artifact-icons/artifact-icons';
import type { Artifact, ArtifactIcon } from '../artifacts/artifacts';

import styles from './artifact-tile.module.css';

const ICON: Record<ArtifactIcon, FC<Partial<BaseIconProps>>> = {
  jellyfish: JellyfishIcon,
  calendar: CalendarIcon,
  image: ImageIcon,
  dice: DiceIcon,
  flame: FlameIcon,
  rocket: RocketIcon,
  search: SearchIcon,
  paint: PaintBucketIcon,
  settings: SettingsIcon,
  refresh: RefreshIcon,
  monitor: MonitorIcon,
  pullRequest: PullRequestIcon,
  clipboardCheck: ClipboardCheckIcon,
};

export const ArtifactTile: FC<{
  artifact: Artifact;
  release: LatestRelease | null;
  featured?: boolean;
}> = ({ artifact, release, featured = false }) => {
  const Icon = ICON[artifact.icon];
  return (
    <article
      className={styles.root}
      data-featured={featured}
      data-group={artifact.group}
    >
      <span className={styles.icon}>
        <Icon size={featured ? 'xl' : 'md'} />
      </span>
      <h4 className={styles.name}>
        <a href={artifact.websiteUrl ?? artifact.githubUrl}>{artifact.name}</a>
      </h4>
      <p className={styles.description}>{artifact.description}</p>
      <div className={styles.meta}>
        {release !== null && (
          <span className={styles.release}>
            <span className={styles.version}>v{release.version}</span>
            <time dateTime={release.publishedAt}>
              {formatDate(new Date(release.publishedAt), 'yyyy年M月d日')}
            </time>
          </span>
        )}
        <span className={styles.links}>
          <a
            aria-label={`${artifact.name} の GitHub`}
            className={styles.link}
            href={artifact.githubUrl}
          >
            <GitHubIcon size="sm" />
          </a>
          {artifact.npmPackageName !== null && (
            <a
              aria-label={`${artifact.name} の npm`}
              className={styles.link}
              href={`https://www.npmjs.com/package/${artifact.npmPackageName}`}
            >
              <PackageIcon size="sm" />
            </a>
          )}
        </span>
      </div>
    </article>
  );
};
