import { createHash, timingSafeEqual } from 'node:crypto';

// 文字列を固定長(32byte)のダイジェストに正規化する。
// 長さの違いで timingSafeEqual が throw するのを避けつつ、
// 入力長の差異から比較対象を推測されないようにする。
const sha256 = (value: string): Buffer =>
  createHash('sha256').update(value).digest();

// cron 実行を認可するための Authorization ヘッダ検証。
// `CRON_SECRET` 未設定時は常に不許可とし、比較はタイミング攻撃を避けるため
// crypto.timingSafeEqual で定数時間比較する。
export const isAuthorizedCronRequest = (req: Request): boolean => {
  const cronSecret = process.env['CRON_SECRET'];
  if (cronSecret === undefined || cronSecret === '') {
    return false;
  }

  const authHeader = req.headers.get('Authorization');
  if (authHeader === null) {
    return false;
  }

  return timingSafeEqual(sha256(authHeader), sha256(`Bearer ${cronSecret}`));
};
