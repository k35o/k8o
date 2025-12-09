# 新規コンポーネント生成

k8o プロジェクトの規約に従った React コンポーネントと Storybook ストーリーを生成します。

**`new-component` スキルを使用してコンポーネントを生成してください。**

## ユーザーに確認する項目

以下の情報をユーザーに確認してください：

1. **コンポーネント名**（PascalCase、例: `UserProfile`, `BlogCard`）
2. **配置パス**:
   - `apps/main/src/app/_components/` (アプリ共通コンポーネント)
   - `apps/main/src/app/[page]/_components/` (ページ固有コンポーネント)
3. **コンポーネントの説明**（用途・機能）

情報を取得したら、`new-component` スキルを起動して実際のファイル生成を行ってください。
