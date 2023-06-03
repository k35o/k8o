import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <section className="h-40 border-2 border-neutral-500">
        <Link href="/characters/counter">
          <div className="flex gap-6 p-4">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center bg-neutral-900 text-7xl">
              📏
            </div>
            <div>
              <h3 className="text-2xl font-medium">
                文字数カウンター
              </h3>
              <p>入力した文字列の長さをカウントします。</p>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
