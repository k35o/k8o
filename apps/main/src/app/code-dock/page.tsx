import { formatCode, lintCode } from '@/features/code-dock/interface/actions';
import { getDefaultLintDiagnostics } from '@/features/code-dock/interface/queries';

import { CodeDock } from './_components/code-dock';

export default async function CodeDockPage() {
  // 初期サンプルの診断結果はデプロイ単位でキャッシュ済み。取得に失敗した場合は
  // null を渡し、クライアントがマウント時に検査するフォールバックに任せる
  const initialDiagnostics = await getDefaultLintDiagnostics().catch(
    () => null,
  );

  return (
    <section className="flex flex-col gap-6 py-10">
      <p className="text-sm">
        このサイトと同じoxcの設定 (oxlint / oxfmt)
        で、入力したコードの検査と整形を試せます。
      </p>
      <CodeDock
        formatAction={formatCode}
        initialDiagnostics={initialDiagnostics}
        lintAction={lintCode}
      />
    </section>
  );
}
