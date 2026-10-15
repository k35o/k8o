import { getArtifacts } from '@/app/artifacts/_utils/artifacts';

import { ArtifactCard } from './_components/artifact-card';

import styles from './page.module.css';

export default function Page() {
  const projects = getArtifacts();
  return (
    <div className={styles.root}>
      {projects.map((project) => (
        <ArtifactCard key={project.name} {...project} />
      ))}
    </div>
  );
}
