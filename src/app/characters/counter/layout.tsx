export const metadata = {
  title: '文字数カウンター',
  description: '入力した文字数をカウントします。',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-l font-medium">文字数カウンター</h3>
      {children}
    </div>
  );
}
