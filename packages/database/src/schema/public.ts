// クライアント(db.ts)に依存しない、スキーマ由来のドメイン定数/型の公開エントリ。
// 実行時の DB クライアントを巻き込まずに型・定数だけを共有するため、`.`(db.ts) ではなく
// このサブパス(@repo/database/schema)から公開する。
export type { PushLogKind } from './push-logs.ts';
export type { BrowserSupportChangeStatus } from './browser-support-feature-changes.ts';
export type {
  BrowserSupportSyncResult,
  BrowserSupportSyncTrigger,
} from './browser-support-sync-runs.ts';
