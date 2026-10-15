import 'server-only';
import { randomUUID } from 'node:crypto';

import { isNonEmptySpec } from '@json-render/core';
import type { Spec } from '@json-render/core';

import {
  insertArtifactWithFirstVersion,
  insertNextVersion,
  selectVersion,
} from '../infrastructure/artifact-repository';

type UiVersion = {
  id: number;
  artifactId: string;
  title: string;
  spec: Spec;
};

// Claude が tool の入力に写す値なので、UUID をそのまま使わず短くする
const newArtifactId = (): string =>
  randomUUID().replaceAll('-', '').slice(0, 12);

const specOf = (content: unknown): Spec | null =>
  typeof content === 'object' &&
  content !== null &&
  'spec' in content &&
  isNonEmptySpec(content.spec)
    ? content.spec
    : null;

export const saveUiVersion = async (input: {
  userId: string;
  threadId: string;
  base: Pick<UiVersion, 'id' | 'artifactId'> | null;
  title: string;
  instruction: string;
  summary: string;
  spec: Spec;
}): Promise<{ artifactId: string; version: number }> => {
  const values = {
    threadId: input.threadId,
    title: input.title,
    instruction: input.instruction,
    summary: input.summary,
    content: { spec: input.spec },
  };
  if (input.base === null) {
    const artifactId = newArtifactId();
    await insertArtifactWithFirstVersion({
      id: artifactId,
      userId: input.userId,
      kind: 'ui',
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

export const findUiVersion = async (input: {
  artifactId: string;
  version: number;
  userId: string;
}): Promise<UiVersion | null> => {
  const row = await selectVersion({ ...input, kind: 'ui' });
  const spec = specOf(row?.content);
  if (row === null || spec === null) {
    return null;
  }
  return { id: row.id, artifactId: input.artifactId, title: row.title, spec };
};
