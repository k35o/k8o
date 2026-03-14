import { Breadcrumb } from '@k8o/arte-odyssey/breadcrumb';
import { Card } from '@k8o/arte-odyssey/card';
import { Separator } from '@k8o/arte-odyssey/separator';
import { db } from '@repo/database';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { updateSource } from '../../_actions/source-actions';
import { DeleteSourceButton } from '../delete-source-button/delete-source-button';
import { SourceForm } from '../source-form/source-form';

export const EditSourceContent = async ({ id }: { id: string }) => {
  'use cache';
  const source = await db.query.articleSources.findFirst({
    where: eq(db._schema.articleSources.id, Number(id)),
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
        <h2 className="font-bold text-2xl">{source.title}</h2>
        <DeleteSourceButton id={source.id} title={source.title} />
      </div>
      <Card>
        <div className="p-6">
          <SourceForm action={action} defaultValues={source} />
        </div>
      </Card>
      <Separator />
      <div className="flex flex-col gap-2 text-fg-mute text-xs">
        <p>作成日: {source.createdAt}</p>
        <p>更新日: {source.updatedAt}</p>
      </div>
    </>
  );
};
