import 'server-only';
import type { OwnerApi } from '@repo/api/owner';
import { hc } from 'hono/client';
import type { InferResponseType } from 'hono/client';

const ownerApiToken = (): string => {
  const token = process.env['OWNER_API_TOKEN'];
  if (!token) {
    throw new Error('OWNER_API_TOKEN が設定されていません');
  }
  // 改行などヘッダーに使えない文字があると、fetch が投げる TypeError の文にトークンが
  // まるごと入り、tool のエラー文として保存されるので、api を呼ぶ前に値を入れない文で弾く。
  // 形は RFC 6750 の b64token（base64・base64url・16進で作った値が通る）
  if (!/^[\w.~+/-]+=*$/u.test(token)) {
    throw new Error(
      'OWNER_API_TOKEN に Bearer のトークンに使えない文字（改行など）が入っています',
    );
  }
  return token;
};

const ownerApi = hc<OwnerApi>('https://api.k8o.me', {
  headers: () => ({ Authorization: `Bearer ${ownerApiToken()}` }),
});

export type OwnerBlog = InferResponseType<
  typeof ownerApi.owner.blogs.$get,
  200
>['items'][number];

// tool の例外はモデルへの tool の結果になるだけでログに残らないので、ここで残す
const unexpectedStatus = (path: string, status: number): Error => {
  const message = `オーナー API の ${path} が ${status} を返しました`;
  console.error(message);
  return new Error(message);
};

export const fetchOwnerBlogs = async (
  signal: AbortSignal | undefined,
): Promise<OwnerBlog[]> => {
  const res = await ownerApi.owner.blogs.$get(
    {},
    { init: { signal: signal ?? null } },
  );
  // hc の型にはルートが返すステータスしか無く、認可の 401 や想定外の 500 は含まれない
  const status: number = res.status;
  if (status !== 200) {
    throw unexpectedStatus('/owner/blogs', status);
  }
  return (await res.json()).items;
};

export const fetchOwnerBlogMarkdown = async (
  slug: string,
  signal: AbortSignal | undefined,
): Promise<string | null> => {
  const res = await ownerApi.owner.blogs[':slug'].$get(
    { param: { slug } },
    { init: { signal: signal ?? null } },
  );
  if (res.status === 404 || res.status === 400) {
    return null;
  }
  const status: number = res.status;
  if (status !== 200) {
    throw unexpectedStatus(`/owner/blogs/${slug}`, status);
  }
  return (await res.json()).markdown;
};
