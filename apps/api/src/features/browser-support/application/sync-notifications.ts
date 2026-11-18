import { countDiff } from './baseline-diff';
import type { BaselineDiff } from './baseline-diff';

export type SyncNotification = {
  kind: 'update' | 'alert';
  title: string;
  body: string;
  dedupeKey: string;
};

export const discoveryFailedAlert = (
  message: string,
  now: Date,
): SyncNotification => ({
  kind: 'alert',
  title: 'Browser Support同期: バージョン発見に失敗',
  body: message,
  dedupeKey: `browser-support:alert:discovery:${now.toISOString().slice(0, 10)}`,
});

export const majorChangedAlert = (
  version: string,
  major: number,
): SyncNotification => ({
  kind: 'alert',
  title: 'Browser Support同期: 上流メジャーバージョン変化',
  body: `web-features v${version} が公開されています。変換・検証の対応後に SUPPORTED_MAJOR を更新してください。それまで前回データで表示を継続します。`,
  dedupeKey: `browser-support:alert:major:v${String(major)}`,
});

export const upstreamStaleAlert = (
  version: string,
  staleDays: number,
): SyncNotification => ({
  kind: 'alert',
  title: 'Browser Support同期: 上流リリースが停滞',
  body: `web-features が ${String(staleDays)} 日以上更新されていません(現行 v${version})。上流の動向を確認してください。`,
  dedupeKey: `browser-support:alert:stale:v${version}`,
});

export const formatBrokenAlert = (
  version: string,
  message: string,
): SyncNotification => ({
  kind: 'alert',
  title: 'Browser Support同期: 上流フォーマットの破壊的変化',
  body: `v${version} の変換に失敗しました: ${message}`,
  dedupeKey: `browser-support:alert:format:v${version}`,
});

export const invariantRejectedAlert = (
  version: string,
  detail: string,
): SyncNotification => ({
  kind: 'alert',
  title: 'Browser Support同期: 検証で拒否',
  body: `v${version}: ${detail}`,
  dedupeKey: `browser-support:alert:invariant:v${version}`,
});

const buildUpdateBody = (diff: BaselineDiff): string => {
  const parts: string[] = [];
  const { newlyCount, widelyCount, statusChangeCount } = countDiff(diff);
  if (newlyCount > 0) {
    parts.push(`Newly: ${String(newlyCount)}件`);
  }
  if (widelyCount > 0) {
    parts.push(`Widely: ${String(widelyCount)}件`);
  }
  if (statusChangeCount > 0) {
    parts.push(`ステータス変更: ${String(statusChangeCount)}件`);
  }
  return parts.join('、');
};

// dedupeKey は版ごと。手動の再同期やトリガーの重なりがあっても、同じ版の更新通知は1回になる
export const updateNotification = (
  version: string,
  diff: BaselineDiff,
): SyncNotification => ({
  kind: 'update',
  title: 'Browser Support更新',
  body: buildUpdateBody(diff),
  dedupeKey: `browser-support:v${version}`,
});

// RootLayout のフロアはリポジトリにコミットした生成物で、反映には PR のマージと
// デプロイを経る。外形監視が PR を出すまで古いフロアが残ることを知らせる。
export const minVersionsChangedAlert = (version: string): SyncNotification => ({
  kind: 'alert',
  title: 'Browser Support: 最低対応バージョンが変化',
  body: `v${version} でブラウザ最低版フロアが変わりました。外形監視が再生成PRを自動で作成し、CI通過後にマージされます。`,
  dedupeKey: `browser-support:alert:min-versions:v${version}`,
});

export const warningAlert = (
  version: string,
  warnings: readonly string[],
): SyncNotification => ({
  kind: 'alert',
  title: 'Browser Support同期: 警告',
  body: `v${version}: ${warnings.join(' / ')}`,
  dedupeKey: `browser-support:alert:warning:v${version}`,
});
