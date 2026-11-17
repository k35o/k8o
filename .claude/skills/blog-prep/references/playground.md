# Playgroundコンポーネント

ディレクトリ名は機能の内容がわかる名前を使用する（例: `caret-position-from-point`, `event-timing`）。

```
apps/main/src/playgrounds/{feature-name}/
├── {demo-name}-demo.tsx           # デモ本体
├── {demo-name}-demo.module.css    # デモのスタイル
├── {demo-name}-demo.stories.tsx   # Storybook
└── index.ts                       # セクションの定義
```

デモが1つなら `{demo-name}` は `{feature-name}` と同じにする。デモが複数あるときは、デモごとに3つのファイルを置く（例: `scope/`）。

`src/playgrounds` の中のファイルは、`next`・`next/*`・`next-themes` と `@/` を import しない（ルートの lint が止める）。リンクは素の `a` で書き、テーマで変える色は CSS の `light-dark()` で書く。デモだけが使う画像は `apps/main/public/playgrounds/{feature-name}-{名前}` に置き、`/playgrounds/{feature-name}-{名前}` の URL で読む。サイトの `public` に既にある画像（アイコンの `/icon.png`）は、写さずにその URL を読む。

## デモ本体とスタイル

スタイルは CSS Modules で書き、値は @k8ordo/ui のトークンだけを使う（規約はルートの `CLAUDE.md` の「UI共通」）。

紹介する CSS そのものを見せるデモでは、その CSS を文字列で持ち、`<style>` で当てて、同じ文字列を `<pre><code>` で表示する。`<style>` の中身はページ全体に効くので、セレクタのクラス名にはほかのデモと衝突しない接頭辞を付ける。

```tsx
import styles from './my-feature-demo.module.css';

const demoStyle = `.mf-target {
  text-decoration-line: underline;
}`;

export function MyFeatureDemo() {
  return (
    <div className={styles.root}>
      <style>{demoStyle}</style>
      <p className="mf-target">対象の要素</p>
      <pre className={styles.code}>
        <code>{demoStyle}</code>
      </pre>
    </div>
  );
}
```

```css
.root {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
}

.code {
  margin-block: 0;
  overflow-x: auto;
  color: var(--color-fg-mute);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
}
```

## Storybookの例

```tsx
import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { MyFeatureDemo } from './my-feature-demo';

const playgroundTitle = MyFeatureDemo.name;

const meta = preview.meta({
  title: 'playgrounds/my-feature/MyFeatureDemo',
  component: MyFeatureDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
```

## index.tsの例

```typescript
import type { PlaygroundSection } from '../types';
import { MyFeatureDemo } from './my-feature-demo';

export const myFeatureSection: PlaygroundSection = {
  id: 'my-feature',
  title: 'My Feature',
  description: '機能の説明',
  category: 'css', // css・html・js-api・performance・react のいずれか
  type: 'blog',
  slug: 'my-feature',
  demos: [
    {
      component: MyFeatureDemo,
      title: 'デモタイトル',
      description: 'デモの説明',
    },
  ],
};
```

## 一覧への登録

一覧に書き足すものは無い。`/playgrounds` の一覧・llms.txt・sitemap（`apps/main/src/playgrounds/sections.ts`）と、`/playgrounds/{id}` のページ・記事の `<PlaygroundEmbed>`（`apps/main/src/components/playgrounds/load-section.ts`）は、どれも `src/playgrounds/{id}/index.ts` を glob で集める。ビルドの paths もディレクトリの名前から作るので、ディレクトリ名とセクションの `id` をそろえる（食い違うと `load-section.test.ts` が落ちる）。無い `sectionId` を記事が渡すと、ビルドの描画で落ちる。
