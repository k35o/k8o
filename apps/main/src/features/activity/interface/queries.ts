import { buildActivityFeed } from '@/features/activity/application/feed';
import type { ActivityItem } from '@/features/activity/application/feed';
import { loadReleases } from '@/features/activity/application/releases';
import type { ReleaseSource } from '@/features/activity/application/releases';
import { getBlogContents } from '@/features/blog/interface/queries';
import { getTalks } from '@/features/talks/interface/queries';

export type { ActivityItem } from '@/features/activity/application/feed';

// 記事・登壇と、渡したパッケージのリリースを新しい順に並べる
export const getActivity = async (
  releaseSources: ReleaseSource[],
): Promise<ActivityItem[]> => {
  const [blogs, talks, releases] = await Promise.all([
    getBlogContents(),
    getTalks(),
    loadReleases(releaseSources),
  ]);
  return buildActivityFeed({ blogs, talks, releases, now: new Date() });
};
