import 'server-only';
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import { type BundleFile, contentTypeFor } from './build-bundle';

// 配信ルートは未認証で叩けるため、slug を 12桁hex に厳格化して path traversal を入口で封じる。
const SLUG_RE = /^[0-9a-f]{12}$/u;
export const isValidSlug = (slug: string): boolean => SLUG_RE.test(slug);

// ビルド済みバンドルの配置/配信/削除の抽象。
export type BundleSink = {
  put: (slug: string, files: readonly BundleFile[]) => Promise<void>;
  get: (
    slug: string,
    segments: readonly string[],
  ) => Promise<{ body: Buffer; contentType: string } | null>;
  remove: (slug: string) => Promise<void>;
};

// staging→rename で原子的に差し替える（再 publish のビルド失敗で配信中のバンドルを壊さない。
// 同一FSなので rename は atomic）。
const SHARED_ROOT = path.resolve(process.cwd(), '.ai-shared');

const localDiskSink: BundleSink = {
  put: async (slug, files) => {
    if (!isValidSlug(slug)) {
      throw new Error('invalid slug');
    }
    await mkdir(SHARED_ROOT, { recursive: true });
    const stagingDir = await mkdtemp(path.join(SHARED_ROOT, '.staging-'));
    try {
      await Promise.all(
        files.map(async (file) => {
          const dest = path.join(stagingDir, ...file.path.split('/'));
          await mkdir(path.dirname(dest), { recursive: true });
          await writeFile(dest, file.body);
        }),
      );
      const finalDir = path.join(SHARED_ROOT, slug);
      await rm(finalDir, { recursive: true, force: true });
      await rename(stagingDir, finalDir);
    } finally {
      // rename 成功時は staging は消えている（force で no-op）。失敗時は中間出力を掃除する。
      await rm(stagingDir, { recursive: true, force: true });
    }
  },
  get: async (slug, segments) => {
    if (!isValidSlug(slug)) {
      return null;
    }
    const base = path.join(SHARED_ROOT, slug);
    const rel = segments.length === 0 ? 'index.html' : path.join(...segments);
    const target = path.normalize(path.join(base, rel));
    // target が slug ディレクトリ配下に収まること（path traversal 防止）を確認する。
    if (target !== base && !target.startsWith(base + path.sep)) {
      return null;
    }
    try {
      return {
        body: await readFile(target),
        contentType: contentTypeFor(target),
      };
    } catch {
      return null;
    }
  },
  remove: async (slug) => {
    if (!isValidSlug(slug)) {
      return;
    }
    await rm(path.join(SHARED_ROOT, slug), { recursive: true, force: true });
  },
};

// TODO(本番): Vercel Blob 用の sink を足してここで分岐する。現状は常にローカルディスク。
export const getBundleSink = (): BundleSink => localDiskSink;
