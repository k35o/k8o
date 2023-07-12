export const metadata = {
  title: 'Converter',
  description:
    '数値の基数の変換やカラーコードの変換など、便利な変換処理を提供します。',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Converter</h2>
      {children}
    </div>
  );
}
