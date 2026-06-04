// Server Action がフォーム/操作結果として返す共通の状態。
// エラー時のみ error にメッセージを格納する。各 feature の Sync 系状態は
// この型を拡張して件数などの固有フィールドを足す。
export type ActionState = {
  error?: string;
  success?: boolean;
};
