import { Card } from '@k8o/arte-odyssey';

import { createTalk } from '@/features/talks/interface/actions';
import { getBlogOptions } from '@/features/talks/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { TalkForm } from '../talk-form';

export const NewTalkContent = async () => {
  await verifySession();
  const blogs = await getBlogOptions();

  return (
    <Card appearance="shadow">
      <div className="p-8">
        <TalkForm action={createTalk} blogs={blogs} />
      </div>
    </Card>
  );
};
