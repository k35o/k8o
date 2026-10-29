import { href } from '@k8ordo/framework';
import { Heading, TagIcon } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import styles from './tags-frame.module.css';

// apps/main では app/tags/layout.tsx が描く枠。layout.tsx に置くと、この CSS をどのページも読むので、
// /tags と /tags/:id のページが描く
export const TagsFrame: FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.root}>
    <div className={styles.content}>
      <div className={styles.header}>
        {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- リンクの名前は中の見出しの文字が持つ。規則は子を浅くしかたどらず、そこまで届かない */}
        <a href={href('/tags')}>
          <Heading level="h2">
            <span className={styles.title}>
              <span className={styles.titleIcon}>
                <TagIcon />
              </span>
              タグ置き場
            </span>
          </Heading>
        </a>
        <p>
          k8oで提供するサービスやブログのタグをまとめました。各タグを利用するコンテンツを確認できます。
        </p>
      </div>
      {children}
    </div>
  </div>
);
