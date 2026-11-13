import { href } from '@k8ordo/framework';
import { Heading, Stack } from '@k8ordo/ui';
import { TagIcon } from '@k8ordo/ui/icons';
import type { FC, ReactNode } from 'react';

import styles from './tags-frame.module.css';

// /tags の枠。layout.tsx に置くと、この CSS をどのページも読むので、
// /tags と /tags/:id のページが描く
export const TagsFrame: FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.root}>
    <Stack gap="lg">
      <Stack gap="md">
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
      </Stack>
      {children}
    </Stack>
  </div>
);
