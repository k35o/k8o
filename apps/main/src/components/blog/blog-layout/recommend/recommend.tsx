import { href } from '@k8ordo/framework';
import { Badge, Card, Grid, Heading, Stack } from '@k8ordo/ui';
import { CalendarIcon, TagIcon } from '@k8ordo/ui/icons';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import type { getBlogsByTags } from '@/features/blog/interface/queries';

import styles from './recommend.module.css';

type RecommendProps = {
  blogs: Awaited<ReturnType<typeof getBlogsByTags>>;
};

export const Recommend: FC<RecommendProps> = ({ blogs }) => {
  if (blogs.length === 0) {
    return null;
  }

  return (
    <Stack gap="xl">
      <Heading level="h3">関連記事</Heading>
      <Grid cols="auto-fit" gap="md" minItemSize={80}>
        {blogs.map((blog) => (
          <Card interactive key={blog.id}>
            {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- リンクの名前は中の記事の題などの文字が持つ。規則は子を浅くしかたどらず、そこまで届かない */}
            <a href={href('/blog/:slug', { slug: blog.slug })}>
              <div className={styles.card}>
                <Heading level="h4">{blog.title}</Heading>
                <div className={styles.details}>
                  <div className={styles.tags}>
                    <TagIcon size="sm" />
                    {blog.tags.map((tag) => (
                      <Badge key={tag} size="sm" label={tag} />
                    ))}
                  </div>
                  <div className={styles.date}>
                    <CalendarIcon size="sm" />
                    <span>
                      公開:{' '}
                      {formatDate(new Date(blog.createdAt), 'yyyy年M月d日')}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
};
