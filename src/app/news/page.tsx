import { NewsCard } from './news-card';

export default function Counter() {
  return (
    <section className="flex h-full flex-col gap-6">
      <NewsCard
        title="お知らせ機能を作成しました"
        summary={
          'お知らせ機能を作成しました。\nこの機能では、重要なお知らせやアップデート情報、ブログの更新などをアプリ内で確認できます。'
        }
        createdAt="2024-12-28T07:00:00.000Z"
        updatedAt="2024-12-28T07:00:00.000Z"
      />
      <NewsCard
        title="お知らせ機能を作成しました"
        summary={
          'お知らせ機能を作成しました。\nこの機能では、重要なお知らせやアップデート情報、ブログの更新などをアプリ内で確認できます。'
        }
        createdAt="2024-12-28T07:00:00.000Z"
        updatedAt="2024-12-28T07:00:00.000Z"
      />
      <NewsCard
        title="お知らせ機能を作成しました"
        summary={
          'お知らせ機能を作成しました。\nこの機能では、重要なお知らせやアップデート情報、ブログの更新などをアプリ内で確認できます。'
        }
        createdAt="2024-12-28T07:00:00.000Z"
        updatedAt="2024-12-28T07:00:00.000Z"
      />
      <NewsCard
        title="お知らせ機能を作成しました"
        summary={
          'お知らせ機能を作成しました。\nこの機能では、重要なお知らせやアップデート情報、ブログの更新などをアプリ内で確認できます。'
        }
        createdAt="2024-12-28T07:00:00.000Z"
        updatedAt="2024-12-28T07:00:00.000Z"
      />
    </section>
  );
}
