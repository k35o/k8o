const READING_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

// reading-list が並べ、OGP を補い、要約する記事の範囲（直近 90 日）の始まり
export const readingWindowStart = (nowMs: number): Date =>
  new Date(nowMs - READING_WINDOW_MS);
