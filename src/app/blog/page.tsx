import { BlogCard } from './components/blog-card';

export default function Page() {
  return (
    <div>
      <BlogCard
        link="/blog/tanstack-router-introduction"
        emotion="😃"
        title="Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ"
        tags={['React', 'TypeScript', 'TanStackRouter']}
      />
    </div>
  );
}
