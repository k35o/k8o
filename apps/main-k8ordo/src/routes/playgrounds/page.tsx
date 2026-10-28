import { PlaygroundsIndex } from '@/components/playgrounds/playgrounds-index/playgrounds-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function PlaygroundsPage() {
  return (
    <>
      <PageMeta
        description="ブログ記事や興味のある技術の試作品を集めています。"
        image={{ path: '/playgrounds/og.png', alt: 'Playgrounds' }}
        path="/playgrounds"
        title="Playgrounds"
        twitterCard="summary_large_image"
      />
      <PlaygroundsIndex />
    </>
  );
}
