import { getTalks } from '@/features/talks/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { TalkList } from '../talk-list';

export const TalksContent = async () => {
  await verifySession();
  const talks = await getTalks();

  return <TalkList talks={talks} />;
};
