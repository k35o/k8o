import { PageMeta } from '@/components/site/page-meta/page-meta';
import { TalksIndex } from '@/components/talks/talks-index/talks-index';
import { getTalks } from '@/features/talks/interface/queries';

export default async function TalksPage() {
  const talks = await getTalks();

  return (
    <>
      <PageMeta
        description="過去の登壇テーマや資料へのリンクをまとめています。"
        image={{ path: '/talks/og.png', alt: 'talks' }}
        path="/talks"
        title="Talks"
      />
      <TalksIndex talks={talks} />
    </>
  );
}
