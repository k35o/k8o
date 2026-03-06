import { getOssProjects } from '@/services/oss/oss';
import { OssCard } from './_components/oss-card';

export default function Page() {
  const projects = getOssProjects();
  return (
    <div className="flex flex-col gap-4">
      {projects.map((project) => (
        <OssCard key={project.name} {...project} />
      ))}
    </div>
  );
}
