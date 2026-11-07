import { MojiCountIndex } from '@/components/moji-count/moji-count-index/moji-count-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function MojiCountPage() {
  return (
    <>
      <PageMeta
        description="テキストの文字数をリアルタイムに数えます。"
        image={{ path: '/moji-count/og.png', alt: 'もじカウント' }}
        path="/moji-count"
        title="もじカウント"
      />
      <MojiCountIndex />
    </>
  );
}
