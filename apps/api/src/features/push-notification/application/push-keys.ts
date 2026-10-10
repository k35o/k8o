// p256dh は非圧縮 P-256 公開鍵(0x04 + 64B = 計65B)、auth は 16〜32B (RFC 8291)
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
