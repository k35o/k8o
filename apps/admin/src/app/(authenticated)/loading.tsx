import { range } from '@repo/helpers/array/range';

// ルートセグメント共通のローディング。prefetch 済みの静的シェルが間に合わない遷移でも、
// 即座に骨組みを描画して白画面のブロックを防ぐ。各ページの実シェルが届くと差し替わる。
export default function Loading() {
  return (
    <div aria-busy aria-label="読み込み中" className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <div className="bg-bg-mute h-7 w-48 rounded-md motion-safe:animate-pulse" />
        <div className="bg-bg-mute h-4 w-72 rounded-md motion-safe:animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {range(0, 3).map((n) => (
          <div
            className="bg-bg-base h-24 rounded-xl shadow-sm motion-safe:animate-pulse"
            key={`stat-skeleton-${n}`}
          />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {range(0, 6).map((n) => (
          <div
            className="bg-bg-base h-16 rounded-lg shadow-sm motion-safe:animate-pulse"
            key={`row-skeleton-${n}`}
          />
        ))}
      </div>
    </div>
  );
}
