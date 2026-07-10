import { formatCode, lintCode } from '@/features/code-dock/interface/actions';

import { CodeDock } from './_components/code-dock';

export default function CodeDockPage() {
  return (
    <section className="flex flex-col gap-6 py-10">
      <p className="text-sm">
        このサイトと同じoxcの設定 (oxlint / oxfmt)
        で、入力したコードの検査と整形を試せます。
      </p>
      <CodeDock formatAction={formatCode} lintAction={lintCode} />
    </section>
  );
}
