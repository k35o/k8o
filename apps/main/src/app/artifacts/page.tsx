import { getArtifacts } from '@/services/artifacts/artifacts';
import { ArtifactCard } from './_components/artifact-card';

export default function Page() {
  const projects = getArtifacts();
  return (
    <div className="flex flex-col gap-4">
      {projects.map((project) => (
        <ArtifactCard key={project.name} {...project} />
      ))}
    </div>
  );
}
