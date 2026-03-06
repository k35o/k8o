import { ExternalLinkIcon, GitHubIcon } from '@k8o/arte-odyssey/icons';
import { LinkButton } from '@k8o/arte-odyssey/link-button';
import { TextTag } from '@k8o/arte-odyssey/text-tag';
import type { FC } from 'react';
import type { OssProject } from '@/services/oss/oss';

export const OssCard: FC<OssProject> = ({
  name,
  description,
  githubUrl,
  npmPackageName,
  tags,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border-mute">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-border-mute border-b bg-bg-subtle px-4 py-3">
        <h2 className="font-bold text-md md:text-lg">{name}</h2>
        <div className="flex flex-wrap gap-2">
          <LinkButton
            href={githubUrl}
            size="sm"
            startIcon={<GitHubIcon size="sm" />}
            variant="outlined"
          >
            GitHubで見る
          </LinkButton>
          {npmPackageName && (
            <LinkButton
              href={`https://www.npmjs.com/package/${npmPackageName}`}
              size="sm"
              startIcon={<ExternalLinkIcon size="sm" />}
              variant="outlined"
            >
              npmで見る
            </LinkButton>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-bg-base p-4">
        <p className="text-fg-mute text-sm">{description}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TextTag key={tag} size="sm" text={tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
