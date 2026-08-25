import { getArtifacts } from '@/app/artifacts/_utils/artifacts';

import { ArtifactCard } from './_components/artifact-card';

export default function Page() {
  const projects = getArtifacts();
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ArtifactCard key={project.name} {...project} />
      ))}
    </div>
  );
}
