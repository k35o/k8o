import { ColorConverterIndex } from '@/components/color-converter/color-converter-index/color-converter-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function ColorConverterPage() {
  return (
    <>
      <PageMeta
        description="HEX・RGB・HSL・HWB・OKLCH・OKLAB・LCH・LABを相互に変換します。どの形式でも貼り付けでき、スライダーで微調整できます。"
        image={{ path: '/color-converter/og.png', alt: 'カラーコード職人' }}
        path="/color-converter"
        title="カラーコード職人"
      />
      <ColorConverterIndex />
    </>
  );
}
