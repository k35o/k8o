import 'server-only';
import { selectVersion } from '../infrastructure/artifact-repository';
import {
  deleteShare,
  selectPublicVersion,
  selectSharedVersionId,
  selectShareOfArtifact,
  updateSharedVersion,
  upsertShare,
} from '../infrastructure/artifact-share-repository';
import { versionFromRow } from './artifacts';
import type { ArtifactVersion } from './artifacts';
import { newShareSlug } from './share-slug';

type ArtifactRef = {
  userId: string;
  artifactId: string;
};

export type ArtifactShare = {
  slug: string;
  version: number;
};

export const publishVersion = async (
  input: ArtifactRef & { version: number },
): Promise<{ slug: string } | null> => {
  const row = await selectVersion(input);
  if (row === null) {
    return null;
  }
  const slug = await upsertShare({
    artifactId: input.artifactId,
    slug: newShareSlug(),
    versionId: row.id,
  });
  return { slug };
};

export type SharedVersionChange = 'changed' | 'unshared' | 'failed';

// 公開と同じ upsert にせず、公開の行が無ければ書かない。別のタブで取り消したあとの古い画面から押されると、
// 取り消した生成物を、版を変えるだけのつもりの操作で別の slug に公開し直してしまうため
export const changeSharedVersion = async (
  input: ArtifactRef & { version: number },
): Promise<SharedVersionChange> => {
  const row = await selectVersion(input);
  if (row === null) {
    return 'failed';
  }
  const changed = await updateSharedVersion({
    artifactId: input.artifactId,
    versionId: row.id,
  });
  return changed ? 'changed' : 'unshared';
};

export const unpublish = (input: ArtifactRef): Promise<boolean> =>
  deleteShare(input);

export const findShareOf = (
  input: ArtifactRef,
): Promise<ArtifactShare | null> => selectShareOfArtifact(input);

export const findSharedVersionId = (slug: string): Promise<number | null> =>
  selectSharedVersionId(slug);

export const findPublicVersion = async (
  versionId: number,
): Promise<ArtifactVersion | null> => {
  const row = await selectPublicVersion(versionId);
  return row === null ? null : versionFromRow(row);
};
