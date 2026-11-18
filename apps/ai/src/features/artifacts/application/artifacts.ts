import 'server-only';
import { randomUUID } from 'node:crypto';

import { isNonEmptySpec } from '@json-render/core';
import type { Spec } from '@json-render/core';

import {
  insertArtifactWithFirstVersion,
  insertNextVersion,
  selectArtifacts,
  selectArtifactVersions,
  selectVersion,
} from '../infrastructure/artifact-repository';
import type { ArtifactContent, ArtifactKind } from './artifact-kind';

type StoredVersion = {
  id: number;
  artifactId: string;
  title: string;
};

type VersionInput = {
  userId: string;
  threadId: string;
  base: Pick<StoredVersion, 'id' | 'artifactId'> | null;
  title: string;
  instruction: string;
  summary: string;
};

type SavedVersion = { artifactId: string; version: number };

type VersionQuery = {
  artifactId: string;
  version: number;
  userId: string;
};

export type ArtifactVersion = ArtifactContent & { title: string };

export type StoredArtifactVersion<Kind extends ArtifactKind> = StoredVersion &
  Extract<ArtifactContent, { kind: Kind }>;

export type ArtifactListItem = {
  id: string;
  kind: ArtifactKind;
  title: string;
  updatedAt: string;
  isPublic: boolean;
};

type VersionOrigin =
  | { type: 'new' }
  | { type: 'edit'; version: number }
  | { type: 'fork'; artifactId: string; version: number; title: string };

type HistoryVersion = {
  version: number;
  title: string;
  instruction: string;
  summary: string;
  threadId: string | null;
  createdAt: string;
  origin: VersionOrigin;
};

type ArtifactHistory = {
  id: string;
  kind: ArtifactKind;
  versions: HistoryVersion[];
};

export type LoadedArtifact = ArtifactHistory & {
  selected: ArtifactVersion & { version: number };
};

// Claude が tool の入力に写す値なので、UUID をそのまま使わず短くする
const newArtifactId = (): string =>
  randomUUID().replaceAll('-', '').slice(0, 12);

export const saveArtifactVersion = async (
  input: VersionInput & { content: ArtifactContent },
): Promise<SavedVersion> => {
  const { kind, ...content } = input.content;
  const values = {
    threadId: input.threadId,
    title: input.title,
    instruction: input.instruction,
    summary: input.summary,
    content,
  };
  if (input.base === null) {
    const artifactId = newArtifactId();
    await insertArtifactWithFirstVersion({
      id: artifactId,
      userId: input.userId,
      kind,
      parentId: null,
      ...values,
    });
    return { artifactId, version: 1 };
  }
  const version = await insertNextVersion({
    artifactId: input.base.artifactId,
    parentId: input.base.id,
    ...values,
  });
  return { artifactId: input.base.artifactId, version };
};

const specOf = (content: unknown): Spec | null =>
  typeof content === 'object' &&
  content !== null &&
  'spec' in content &&
  isNonEmptySpec(content.spec)
    ? content.spec
    : null;

const sourceOf = (content: unknown): string | null =>
  typeof content === 'object' &&
  content !== null &&
  'source' in content &&
  typeof content.source === 'string' &&
  content.source.trim() !== ''
    ? content.source
    : null;

const contentOf = (
  kind: ArtifactKind,
  content: unknown,
): ArtifactContent | null => {
  if (kind === 'ui') {
    const spec = specOf(content);
    return spec === null ? null : { kind, spec };
  }
  const source = sourceOf(content);
  return source === null ? null : { kind, source };
};

export const versionFromRow = (row: {
  kind: ArtifactKind;
  title: string;
  content: unknown;
}): ArtifactVersion | null => {
  const content = contentOf(row.kind, row.content);
  return content === null ? null : { title: row.title, ...content };
};

const readVersion = async (
  input: VersionQuery,
): Promise<{ id: number; version: ArtifactVersion } | null> => {
  const row = await selectVersion(input);
  if (row === null) {
    return null;
  }
  const version = versionFromRow(row);
  return version === null ? null : { id: row.id, version };
};

const isKind = <Kind extends ArtifactKind>(
  version: ArtifactVersion,
  kind: Kind,
): version is Extract<ArtifactVersion, { kind: Kind }> => version.kind === kind;

export const findArtifactVersion = async <Kind extends ArtifactKind>({
  kind,
  ...query
}: VersionQuery & {
  kind: Kind;
}): Promise<StoredArtifactVersion<Kind> | null> => {
  const stored = await readVersion(query);
  if (stored === null || !isKind(stored.version, kind)) {
    return null;
  }
  return { id: stored.id, artifactId: query.artifactId, ...stored.version };
};

export const forkVersion = async (
  input: VersionQuery,
): Promise<SavedVersion | null> => {
  const row = await selectVersion(input);
  if (row === null) {
    return null;
  }
  const artifactId = newArtifactId();
  await insertArtifactWithFirstVersion({
    id: artifactId,
    userId: input.userId,
    kind: row.kind,
    parentId: row.id,
    threadId: null,
    title: `${row.title}（フォーク）`,
    // 依頼から生まれた版ではないが、列が NOT NULL なので空にする
    instruction: '',
    summary: row.summary,
    content: row.content,
  });
  return { artifactId, version: 1 };
};

export const listArtifacts = async (input: {
  userId: string;
}): Promise<ArtifactListItem[]> => selectArtifacts(input);

const originOf = (
  artifactId: string,
  parent: {
    artifactId: string | null;
    version: number | null;
    title: string | null;
  },
): VersionOrigin => {
  if (
    parent.artifactId === null ||
    parent.version === null ||
    parent.title === null
  ) {
    return { type: 'new' };
  }
  return parent.artifactId === artifactId
    ? { type: 'edit', version: parent.version }
    : {
        type: 'fork',
        artifactId: parent.artifactId,
        version: parent.version,
        title: parent.title,
      };
};

const getArtifactHistory = async (input: {
  artifactId: string;
  userId: string;
}): Promise<ArtifactHistory | null> => {
  const rows = await selectArtifactVersions(input);
  const [latest] = rows;
  if (latest === undefined) {
    return null;
  }
  return {
    id: input.artifactId,
    kind: latest.kind,
    versions: rows.map((row) => ({
      version: row.version,
      title: row.title,
      instruction: row.instruction,
      summary: row.summary,
      threadId: row.threadId,
      createdAt: row.createdAt,
      origin: originOf(input.artifactId, {
        artifactId: row.parentArtifactId,
        version: row.parentVersion,
        title: row.parentTitle,
      }),
    })),
  };
};

export const loadArtifact = async (input: {
  artifactId: string;
  version: number | null;
  userId: string;
}): Promise<LoadedArtifact | null> => {
  const history = await getArtifactHistory({
    artifactId: input.artifactId,
    userId: input.userId,
  });
  const version = input.version ?? history?.versions[0]?.version;
  if (history === null || version === undefined) {
    return null;
  }
  const stored = await readVersion({ ...input, version });
  return stored === null
    ? null
    : { ...history, selected: { version, ...stored.version } };
};

const VERSION_PARAM = /^[1-9][0-9]*$/u;

export const versionFromParam = (
  value: string | string[] | undefined,
): number | null | 'invalid' => {
  if (value === undefined) {
    return null;
  }
  if (typeof value !== 'string' || !VERSION_PARAM.test(value)) {
    return 'invalid';
  }
  const version = Number(value);
  return Number.isSafeInteger(version) ? version : 'invalid';
};
