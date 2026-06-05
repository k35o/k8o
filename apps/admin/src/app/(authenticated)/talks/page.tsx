import { PageHeader } from '@/app/(authenticated)/_components';
import { getTalks } from '@/features/talks/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { AddTalkLink } from './_components/add-talk-link';
import { TalkList } from './_components/talk-list';

export default async function TalksPage() {
  await verifySession();
  const talks = await getTalks();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        action={<AddTalkLink />}
        description="登壇・スライドのイベント情報を管理します"
        title="トーク"
      />
      <TalkList talks={talks} />
    </div>
  );
}
