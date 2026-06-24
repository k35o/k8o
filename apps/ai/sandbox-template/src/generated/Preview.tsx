import { Card, Heading } from '@k8o/arte-odyssey';

// 生成コードの差し替え先（既定のプレースホルダ）。実行時に Studio が上書きする。
export default function Preview() {
  return (
    <div className="bg-bg-surface flex min-h-screen items-center justify-center p-8">
      <Card appearance="shadow">
        <div className="flex flex-col gap-3 p-10 text-center">
          <Heading type="h2">k8o AI Studio</Heading>
          <p className="text-fg-mute text-sm leading-relaxed">
            ここに生成された UI のプレビューが表示されます。
          </p>
        </div>
      </Card>
    </div>
  );
}
