import { RadiusMakerIndex } from '@/components/radius-maker/radius-maker-index/radius-maker-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function RadiusMakerPage() {
  return (
    <>
      <PageMeta
        description="border-radiusを視覚的に操作してCSSを生成します。"
        image={{ path: '/radius-maker/og.png', alt: 'かどまるラボ' }}
        path="/radius-maker"
        title="かどまるラボ"
      />
      <RadiusMakerIndex />
    </>
  );
}
