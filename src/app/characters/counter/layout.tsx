export const metadata = {
  title: '文字列カウンター',
  description: '入力した文字数をカウントします。',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-medium">文字列カウンター</h3>
      {children}
    </div>
  );
}
