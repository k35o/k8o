import { Breadcrumb, Card } from '@k8o/arte-odyssey';

import { verifySession } from '@/libs/verify-session';

import { createSource } from '../../_actions/source-actions';
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
      <h2 className="text-2xl font-bold">ソースを追加</h2>
      <Card>
        <div className="p-6">
          <SourceForm action={createSource} />
        </div>
      </Card>
    </div>
  );
}
