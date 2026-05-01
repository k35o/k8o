import {
  Badge,
  ExternalLinkIcon,
  GitHubIcon,
  Heading,
  LinkButton,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

import type { Artifact } from '@/features/artifacts/interface/queries';

export const ArtifactCard: FC<Artifact> = ({
  name,
  description,
  githubUrl,
  websiteUrl,
  npmPackageName,
  tags,
}) => (
  <article className="border-border-mute bg-bg-base flex h-full flex-col gap-5 rounded-xl border px-5 py-5 shadow-sm transition-colors md:px-6 md:py-6">
    <div className="flex flex-col gap-2">
      <Heading type="h3">{name}</Heading>
      <p className="text-fg-mute max-w-3xl text-sm leading-relaxed md:text-base">
        {description}
      </p>
    </div>

    <div className="border-border-mute mt-auto flex flex-col gap-4 border-t pt-4">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} size="sm" text={tag} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <LinkButton
          href={githubUrl}
          size="sm"
          startIcon={<GitHubIcon size="sm" />}
          variant="outlined"
        >
          GitHubで見る
        </LinkButton>
        {websiteUrl !== null && (
          <LinkButton
            href={websiteUrl}
            size="sm"
            startIcon={<ExternalLinkIcon size="sm" />}
            variant="outlined"
          >
            サイトで見る
          </LinkButton>
        )}
        {npmPackageName !== null && (
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
  </article>
);
