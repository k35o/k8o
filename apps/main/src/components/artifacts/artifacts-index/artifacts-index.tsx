import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import type { LatestRelease } from '@/features/activity/interface/queries';

import { ArtifactTile } from '../artifact-tile/artifact-tile';
import { ARTIFACT_GROUPS, getArtifacts } from '../artifacts/artifacts';

import styles from './artifacts-index.module.css';

export const ArtifactsIndex: FC<{
  // npm のパッケージの名前ごとの最後の版
  releases: Record<string, LatestRelease>;
}> = ({ releases }) => {
  const artifacts = getArtifacts();

  return (
    <div className={styles.root}>
      <Heading level="h2">Artifacts</Heading>
      {ARTIFACT_GROUPS.map(({ group, title }) => (
        <section className={styles.group} key={group}>
          {title !== null && <h3 className={styles.title}>{title}</h3>}
          <ul className={styles.tiles}>
            {artifacts
              .filter((artifact) => artifact.group === group)
              .map((artifact) => (
                <li
                  className={title === null ? styles.featured : undefined}
                  key={artifact.name}
                >
                  <ArtifactTile
                    artifact={artifact}
                    featured={title === null}
                    release={
                      artifact.npmPackageName === null
                        ? null
                        : (releases[artifact.npmPackageName] ?? null)
                    }
                  />
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
