import { verifySession } from '@repo/auth-shell/verify-session';

import { getTalks } from '@/features/talks/interface/queries';

import { TalkList } from '../talk-list';

export const TalksContent = async () => {
  await verifySession();
  const talks = await getTalks();

  return <TalkList talks={talks} />;
};
