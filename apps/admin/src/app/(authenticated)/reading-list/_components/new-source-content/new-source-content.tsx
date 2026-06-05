import { Card } from '@k8o/arte-odyssey';

import { createSource } from '@/features/reading-list/interface/source-actions';
import { verifySession } from '@/shared/auth/verify-session';

import { SourceForm } from '../source-form/source-form';

export const NewSourceContent = async () => {
  await verifySession();

  return (
    <Card appearance="shadow">
      <div className="p-8">
        <SourceForm action={createSource} />
      </div>
    </Card>
  );
};
