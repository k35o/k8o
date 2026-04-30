import { verifySession } from '@/shared/auth/verify-session';
import { EditSourceContent } from '../../_components/edit-source-content/edit-source-content';

export default async function EditSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <EditSourceContent id={id} />
    </div>
  );
}
