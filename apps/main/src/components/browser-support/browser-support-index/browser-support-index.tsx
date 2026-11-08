import { Heading, Stack } from '@k8ordo/ui';
import type { FC } from 'react';

import type { BlogLink } from '@/features/blog/interface/queries';
import type { BrowserSupportSnapshot } from '@/features/browser-support/interface/queries';

import { BrowserSupportHelpDialog } from '../browser-support-help-dialog';
import { BrowserSupportLive } from '../browser-support-live';

import styles from './browser-support-index.module.css';

export const BrowserSupportIndex: FC<{
  snapshot: BrowserSupportSnapshot;
  blogMap: Record<string, BlogLink>;
}> = ({ snapshot, blogMap }) => (
  <div className={styles.root}>
    <Stack gap="lg">
      <div className={styles.titleRow}>
        <Heading level="h2">Browser Support</Heading>
        <BrowserSupportHelpDialog />
      </div>
      <BrowserSupportLive blogMap={blogMap} snapshot={snapshot} />
    </Stack>
  </div>
);
