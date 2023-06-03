export const metadata = {
  title: 'Characters',
  description: '文章や文字に対する操作を提供するサイトです。',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-medium">Characters</h2>
      {children}
    </div>
  );
}
