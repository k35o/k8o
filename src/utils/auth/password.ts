import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// パスワードハッシュ化のパラメータ
const SALT_LENGTH = 32;
const KEY_LENGTH = 64;

/**
 * パスワードをハッシュ化
 */
export async function hashPassword(
  password: string,
): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = (await scryptAsync(
    password,
    salt,
    KEY_LENGTH,
  )) as Buffer;

  // salt + key を base64 で結合
  return `${salt.toString('base64')}:${key.toString('base64')}`;
}

/**
 * パスワード検証
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    const [saltBase64, keyBase64] = hashedPassword.split(':');

    if (!saltBase64 || !keyBase64) {
      return false;
    }

    const salt = Buffer.from(saltBase64, 'base64');
    const storedKey = Buffer.from(keyBase64, 'base64');

    const derivedKey = (await scryptAsync(
      password,
      salt,
      KEY_LENGTH,
    )) as Buffer;

    // タイミング攻撃を防ぐため timingSafeEqual を使用
    return (
      storedKey.length === derivedKey.length &&
      timingSafeEqual(storedKey, derivedKey)
    );
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * パスワード強度チェック
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }

  if (password.length > 128) {
    errors.push('パスワードは128文字以下である必要があります');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('パスワードには小文字を含める必要があります');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('パスワードには大文字を含める必要があります');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('パスワードには数字を含める必要があります');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('パスワードには記号を含める必要があります');
  }

  // 一般的な弱いパスワードのチェック
  const weakPasswords = [
    'password',
    'password123',
    '12345678',
    'qwerty123',
    'admin123',
    'adminadmin',
    'password1',
    '123456789',
  ];

  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push(
      'よく使われるパスワードです。別のパスワードを選択してください',
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * ランダムなパスワードを生成
 */
export function generateRandomPassword(length = 16): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}
