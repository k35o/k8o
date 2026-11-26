import { Card } from '@k8ordo/ui';
import { ChevronIcon } from '@k8ordo/ui/icons';
import type { FC, ReactNode } from 'react';

import styles from './home-panel.module.css';

type PanelHeading = {
  title: string;
  icon: ReactNode;
  tone: 'readings' | 'baseline';
};

const Head: FC<PanelHeading & { meta?: ReactNode }> = ({
  title,
  icon,
  tone,
  meta,
}) => (
  <div className={styles.head}>
    <span aria-hidden="true" className={styles.icon} data-tone={tone}>
      {icon}
    </span>
    <h2 className={styles.title}>{title}</h2>
    {meta}
  </div>
);

export const HomePanel: FC<
  PanelHeading & {
    meta?: ReactNode;
    more: { href: string; label: string };
    children: ReactNode;
  }
> = ({ more, children, ...heading }) => (
  <Card>
    <section className={styles.root}>
      <Head {...heading} />
      {children}
      <a className={styles.more} href={more.href}>
        {more.label}
        <ChevronIcon direction="right" size="sm" />
      </a>
    </section>
  </Card>
);

export const HomePanelSkeleton: FC<PanelHeading & { children: ReactNode }> = ({
  children,
  ...heading
}) => (
  <Card>
    <section aria-busy="true" className={styles.root}>
      <Head {...heading} />
      <div aria-hidden="true" className={styles.skeleton}>
        {children}
      </div>
    </section>
  </Card>
);

export const SkeletonLine: FC<{ width: 'full' | 'long' | 'short' }> = ({
  width,
}) => <span className={styles.line} data-width={width} />;
