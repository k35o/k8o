import { Breadcrumb, Card, Separator } from '@k8o/arte-odyssey';
import { db } from '@repo/database';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { updateSource } from '../../_actions/source-actions';
import { DeleteSourceButton } from '../delete-source-button/delete-source-button';
import { SourceForm } from '../source-form/source-form';

export const EditSourceContent = async ({ id }: { id: string }) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    notFound();
  }

  const source = await db.query.articleSources.findFirst({
    where: eq(db._schema.articleSources.id, numericId),
  });

  if (!source) {
    notFound();
  }

  const action = updateSource.bind(null, source.id);

  return (
    <>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/reading-list">よんでいるもの</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>{source.title}</Breadcrumb.Item>
      </Breadcrumb.List>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{source.title}</h2>
        <DeleteSourceButton id={source.id} title={source.title} />
      </div>
      <Card>
        <div className="p-6">
          <SourceForm action={action} defaultValues={source} />
        </div>
      </Card>
      <Separator />
      <div className="text-fg-mute flex flex-col gap-2 text-xs">
        <p>作成日: {source.createdAt}</p>
        <p>更新日: {source.updatedAt}</p>
      </div>
    </>
  );
};
