import { IconLink } from '@k8o/arte-odyssey/icon-link';
import {
  QiitaIcon,
  RSSIcon,
  ZennIcon,
} from '@k8o/arte-odyssey/icons';
import { FC } from 'react';

export const ExternalBlog: FC = () => {
  return (
    <div className="flex gap-4">
      <IconLink
        href="https://qiita.com/k8o"
        bg="base"
        label="Qiitaのアカウント"
      >
        <QiitaIcon />
      </IconLink>
      <IconLink
        href="https://zenn.dev/kokisakano"
        bg="base"
        label="Zennのアカウント"
      >
        <ZennIcon />
      </IconLink>
      <IconLink
        href="/blog/feed"
        bg="base"
        label="RSSフィード"
        openInNewTab
      >
        <RSSIcon />
      </IconLink>
    </div>
  );
};
