import 'server-only';
import { randomUUID } from 'node:crypto';

import { isNonEmptySpec } from '@json-render/core';
import type { Spec } from '@json-render/core';
import type { AiArtifactKind } from '@repo/ai-database/schema';

import {
  insertArtifactWithFirstVersion,
  insertNextVersion,
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

export const saveUiVersion = ({
  spec,
  ...input
}: VersionInput & { spec: Spec }): Promise<SavedVersion> =>
  saveVersion({ ...input, kind: 'ui', content: { spec } });

export const findUiVersion = async (
  input: VersionQuery,
): Promise<UiVersion | null> => {
  const row = await selectVersion({ ...input, kind: 'ui' });
  const spec = specOf(row?.content);
  if (row === null || spec === null) {
    return null;
  }
  return { id: row.id, artifactId: input.artifactId, title: row.title, spec };
};

export const saveSlidesVersion = ({
  source,
  ...input
}: VersionInput & { source: string }): Promise<SavedVersion> =>
  saveVersion({ ...input, kind: 'slides', content: { source } });

export const findSlidesVersion = async (
  input: VersionQuery,
): Promise<SlidesVersion | null> => {
  const row = await selectVersion({ ...input, kind: 'slides' });
  const source = sourceOf(row?.content);
  if (row === null || source === null) {
    return null;
  }
  return {
    id: row.id,
    artifactId: input.artifactId,
    title: row.title,
    source,
  };
};
