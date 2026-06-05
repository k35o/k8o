import { Breadcrumb, Card, Heading } from '@k8o/arte-odyssey';

import { createSource } from '@/features/reading-list/interface/source-actions';
import { verifySession } from '@/shared/auth/verify-session';

import { SourceForm } from '../../_components/source-form/source-form';

export default async function NewSourcePage() {
  await verifySession();
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/reading-list">よんでいるもの</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>ソースを追加</Breadcrumb.Item>
      </Breadcrumb.List>
      <Heading type="h1">ソースを追加</Heading>
      <Card appearance="shadow">
        <div className="p-8">
          <SourceForm action={createSource} />
        </div>
      </Card>
    </div>
  );
}
