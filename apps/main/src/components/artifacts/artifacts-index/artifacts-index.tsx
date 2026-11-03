import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import { ArtifactCard } from '../artifact-card/artifact-card';
import { getArtifacts } from '../artifacts/artifacts';

import styles from './artifacts-index.module.css';

export const ArtifactsIndex: FC = () => (
  <div className={styles.root}>
    <div className={styles.content}>
      <Heading level="h2">Artifacts</Heading>
      <div className={styles.section}>
        {getArtifacts().map((artifact) => (
          <ArtifactCard key={artifact.name} {...artifact} />
        ))}
      </div>
    </div>
  </div>
);
