import 'server-only';
import { randomUUID } from 'node:crypto';

import { isNonEmptySpec } from '@json-render/core';
import type { Spec } from '@json-render/core';
import type { AiArtifactKind } from '@repo/ai-database/schema';

import {
  insertArtifactWithFirstVersion,
  insertNextVersion,
  selectArtifacts,
  selectArtifactVersions,
  selectVersion,
} from '../infrastructure/artifact-repository';

type StoredVersion = {
  id: number;
  artifactId: string;
  title: string;
};

type UiVersion = StoredVersion & { spec: Spec };

type SlidesVersion = StoredVersion & { source: string };

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

type ArtifactContent =
  | { kind: 'ui'; spec: Spec }
  | { kind: 'slides'; source: string };

export type ArtifactVersion = ArtifactContent & { title: string };

export type ArtifactListItem = {
  id: string;
  kind: AiArtifactKind;
  title: string;
  updatedAt: string;
  isPublic: boolean;
};

type VersionOrigin = { type: 'new' } | { type: 'edit'; version: number };

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
  kind: AiArtifactKind;
  versions: HistoryVersion[];
};

export type LoadedArtifact = ArtifactHistory & {
  selected: ArtifactVersion & { version: number };
};

// Claude が tool の入力に写す値なので、UUID をそのまま使わず短くする
const newArtifactId = (): string =>
  randomUUID().replaceAll('-', '').slice(0, 12);

const saveVersion = async (
  input: VersionInput & { kind: AiArtifactKind; content: unknown },
): Promise<SavedVersion> => {
  const values = {
    threadId: input.threadId,
    title: input.title,
    instruction: input.instruction,
    summary: input.summary,
    content: input.content,
  };
  if (input.base === null) {
    const artifactId = newArtifactId();
    await insertArtifactWithFirstVersion({
      id: artifactId,
      userId: input.userId,
      kind: input.kind,
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
  kind: AiArtifactKind,
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
  kind: AiArtifactKind;
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

export const saveUiVersion = ({
  spec,
  ...input
}: VersionInput & { spec: Spec }): Promise<SavedVersion> =>
  saveVersion({ ...input, kind: 'ui', content: { spec } });

export const findUiVersion = async (
  input: VersionQuery,
): Promise<UiVersion | null> => {
  const stored = await readVersion(input);
  if (stored?.version.kind !== 'ui') {
    return null;
  }
  return {
    id: stored.id,
    artifactId: input.artifactId,
    title: stored.version.title,
    spec: stored.version.spec,
  };
};

export const saveSlidesVersion = ({
  source,
  ...input
}: VersionInput & { source: string }): Promise<SavedVersion> =>
  saveVersion({ ...input, kind: 'slides', content: { source } });

export const findSlidesVersion = async (
  input: VersionQuery,
): Promise<SlidesVersion | null> => {
  const stored = await readVersion(input);
  if (stored?.version.kind !== 'slides') {
    return null;
  }
  return {
    id: stored.id,
    artifactId: input.artifactId,
    title: stored.version.title,
    source: stored.version.source,
  };
};

export const listArtifacts = async (input: {
  userId: string;
}): Promise<ArtifactListItem[]> => selectArtifacts(input);

const originOf = (
  artifactId: string,
  parent: { artifactId: string | null; version: number | null },
): VersionOrigin =>
  parent.artifactId === artifactId && parent.version !== null
    ? { type: 'edit', version: parent.version }
    : { type: 'new' };

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
