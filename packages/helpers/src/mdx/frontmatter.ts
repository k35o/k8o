import { readFile } from 'node:fs/promises';
import type { BlogMetadata } from './types';

type RawMetadata = {
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

// MDXファイルからexportされたmetadataオブジェクトを抽出
const parseMetadataObject = (content: string, path: string): RawMetadata => {
  // export const metadata = { ... }; の形式を抽出
  const metadataRegex = /export\s+const\s+metadata\s*=\s*\{([\s\S]*?)\};/;
  const metadataMatch = metadataRegex.exec(content);
  const objectContent = metadataMatch?.[1];
  if (!objectContent) {
    throw new Error(`No metadata export found in file: ${path}`);
  }

  // 各フィールドを抽出
  const extractString = (field: string): string | null => {
    // 複数行対応: 'value' または "value" の形式
    const regex = new RegExp(
      `${field}:\\s*(['"\`])([\\s\\S]*?)\\1(?:,|\\s*$)`,
      'm',
    );
    const match = regex.exec(objectContent);
    return match?.[2] ?? null;
  };

  const extractNullableString = (field: string): string | null => {
    // nullの場合をチェック
    const nullRegex = new RegExp(`${field}:\\s*null`);
    if (nullRegex.test(objectContent)) {
      return null;
    }
    return extractString(field);
  };

  const title = extractString('title');
  const description = extractNullableString('description');
  const createdAt = extractString('createdAt');
  const updatedAt = extractString('updatedAt');

  if (!(title && createdAt && updatedAt)) {
    throw new Error(
      `Missing required fields in ${path}: title=${title}, createdAt=${createdAt}, updatedAt=${updatedAt}`,
    );
  }

  return {
    title,
    description,
    createdAt,
    updatedAt,
  };
};

export const getMetadata = async (path: string): Promise<BlogMetadata> => {
  const content = await readFile(path, 'utf-8');
  const raw = parseMetadataObject(content, path);

  return {
    title: raw.title,
    description: raw.description,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
};

// 後方互換性のためのエイリアス
export const getFrontmatter = getMetadata;
