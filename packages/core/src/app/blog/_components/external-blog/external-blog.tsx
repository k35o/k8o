import { IconLink } from '@k8o/arte-odyssey/icon-link';
import { QiitaIcon, RSSIcon, ZennIcon } from '@k8o/arte-odyssey/icons';
import type { FC } from 'react';

export const ExternalBlog: FC = () => {
  return (
    <div className="flex gap-4">
      <IconLink
        bg="base"
        href="https://qiita.com/k8o"
        label="Qiitaのアカウント"
      >
        <QiitaIcon />
      </IconLink>
      <IconLink
        bg="base"
        href="https://zenn.dev/kokisakano"
        label="Zennのアカウント"
      >
        <ZennIcon />
      </IconLink>
      <IconLink bg="base" href="/blog/feed" label="RSSフィード" openInNewTab>
        <RSSIcon />
      </IconLink>
    </div>
  );
};
