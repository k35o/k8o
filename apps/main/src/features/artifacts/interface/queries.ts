import { getArtifacts as _getArtifacts } from '../application/artifacts';

export function getArtifacts() {
  return _getArtifacts();
}

export type { Artifact } from '../application/artifacts';
