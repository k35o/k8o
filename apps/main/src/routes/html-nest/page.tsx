import { HtmlNestIndex } from '@/components/html-nest/html-nest-index/html-nest-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function HtmlNestPage() {
  return (
    <>
      <PageMeta
        description="HTMLタグを選ぶと、親に置ける要素と中に入れられる子要素が浮かび上がります。"
        image={{ path: '/html-nest/og.png', alt: 'HTMLいれ子マップ' }}
        path="/html-nest"
        title="HTMLいれ子マップ"
      />
      <HtmlNestIndex />
    </>
  );
}
