// Web Push の購読鍵の形式を検証する。
// p256dh は非圧縮 P-256 公開鍵(先頭 0x04 + 65 bytes)、auth は 16〜32 bytes(RFC 8291)。
// 不正な鍵を永続保存しないよう登録時に弾く。
export const isValidPushKeys = (p256dh: string, auth: string): boolean => {
  const p256dhBytes = Buffer.from(p256dh, 'base64url');
  const authBytes = Buffer.from(auth, 'base64url');
  return (
    p256dhBytes.length === 65 &&
    p256dhBytes[0] === 0x04 &&
    authBytes.length >= 16 &&
    authBytes.length <= 32
  );
};
