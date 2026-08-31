import { Card } from '@k8ordo/ui';
import { verifySession } from '@repo/auth-shell/verify-session';

import { createTalk } from '@/features/talks/interface/actions';
import { getBlogOptions } from '@/features/talks/interface/queries';

import { TalkForm } from '../talk-form';

export const NewTalkContent = async () => {
  await verifySession();
  const blogs = await getBlogOptions();

  return (
    <Card variant="shadow">
      <div className="p-8">
        <TalkForm action={createTalk} blogs={blogs} />
      </div>
    </Card>
  );
};
