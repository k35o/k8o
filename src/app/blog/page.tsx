import { BlogCard } from './_components/blog-card';

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <BlogCard
        link="/blog/color-contrast"
        emotion="⚖️"
        title="色のコントラスト比は重要だけどどうやって求めるんだっけ？"
        tags={['color contrast', 'a11y', 'WCAG', 'W3C']}
      />
      <BlogCard
        link="/blog/tanstack-router-introduction"
        emotion="😃"
        title="Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ"
        tags={['React', 'TypeScript', 'TanStackRouter']}
      />
    </div>
  );
}
