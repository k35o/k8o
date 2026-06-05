import { Breadcrumb, Card, Heading } from '@k8o/arte-odyssey';

import { createTalk } from '@/features/talks/interface/actions';
import { getBlogOptions } from '@/features/talks/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { TalkForm } from '../_components/talk-form';

export default async function NewTalkPage() {
  await verifySession();
  const blogs = await getBlogOptions();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/talks">トーク</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>トークを追加</Breadcrumb.Item>
      </Breadcrumb.List>
      <Heading type="h1">トークを追加</Heading>
      <Card appearance="shadow">
        <div className="p-8">
          <TalkForm action={createTalk} blogs={blogs} />
        </div>
      </Card>
    </div>
  );
}
