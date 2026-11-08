import { read } from 'to-vfile';
import { matter } from 'vfile-matter';

export type Frontmatter = {
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  featureIds?: string[];
};

export const getFrontmatter = async (path: string): Promise<Frontmatter> => {
  const file = await read(path);
  matter(file);
  const data = file.data['matter'];
  if (!isFrontmatter(data)) {
    throw new Error(`Invalid frontmatter in ${path}`);
  }
  return data;
};

// 一覧系がファイル欠損だけをスキップ対象にできるよう、ENOENTのみnullに写し、
// frontmatter不正など他のエラーはそのまま投げ分ける。
export const findFrontmatter = async (
  path: string,
): Promise<Frontmatter | null> => {
  try {
    return await getFrontmatter(path);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

const isDateString = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));

const isFrontmatter = (value: unknown): value is Frontmatter => {
  if (typeof value !== 'object' || value === null) return false;
  if (!('title' in value) || typeof value.title !== 'string') return false;
  if (
    !('description' in value) ||
    (value.description !== null && typeof value.description !== 'string')
  )
    return false;
  if (!('createdAt' in value) || !isDateString(value.createdAt)) return false;
  if (!('updatedAt' in value) || !isDateString(value.updatedAt)) return false;
  if ('featureIds' in value && value.featureIds !== undefined) {
    if (!Array.isArray(value.featureIds)) return false;
    if (!value.featureIds.every((id: unknown) => typeof id === 'string'))
      return false;
  }
  return true;
};
