import { Breadcrumb, Card, Heading } from '@k8o/arte-odyssey';
import { notFound } from 'next/navigation';

import { updateTalk } from '@/features/talks/interface/actions';
import {
  getBlogOptions,
  getTalkForEdit,
} from '@/features/talks/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { TalkForm } from '../_components/talk-form';

export default async function EditTalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const [talk, blogs] = await Promise.all([
    getTalkForEdit(id),
    getBlogOptions(),
  ]);

  if (!talk) {
    notFound();
  }

  const action = updateTalk.bind(null, talk.id);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/talks">トーク</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>{talk.title}</Breadcrumb.Item>
      </Breadcrumb.List>
      <Heading type="h1">トークを編集</Heading>
      <Card appearance="shadow">
        <div className="p-8">
          <TalkForm
            action={action}
            blogs={blogs}
            defaultValues={{
              title: talk.title,
              eventName: talk.eventName,
              eventDate: talk.eventDate,
              eventLocation: talk.eventLocation,
              eventUrl: talk.eventUrl,
              slideUrl: talk.slideUrl,
              blogId: talk.blogId,
            }}
          />
        </div>
      </Card>
    </div>
  );
}
