import { PaletteMakerIndex } from '@/components/palette-maker/palette-maker-index/palette-maker-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function PaletteMakerPage() {
  return (
    <>
      <PageMeta
        description="OKLCHの明度スケールで11段階のカラーパレットを生成し、コントラストを検証します。"
        image={{ path: '/palette-maker/og.png', alt: 'いろばしご' }}
        path="/palette-maker"
        title="いろばしご"
      />
      <PaletteMakerIndex />
    </>
  );
}
