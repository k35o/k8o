'use client';

import {
  Badge,
  Button,
  ExternalLinkIcon,
  GitHubIcon,
  Heading,
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
  <article className="border-border-mute bg-bg-base flex h-full flex-col gap-5 rounded-xl border p-5 shadow-sm transition-colors md:p-6">
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
        <Button
          renderItem={({ className, children }) => (
            <a
              className={className}
              href={githubUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {children}
            </a>
          )}
          size="sm"
          startIcon={<GitHubIcon size="sm" />}
          variant="outline"
        >
          GitHubで見る
        </Button>
        {websiteUrl !== null && (
          <Button
            renderItem={({ className, children }) => (
              <a
                className={className}
                href={websiteUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {children}
              </a>
            )}
            size="sm"
            startIcon={<ExternalLinkIcon size="sm" />}
            variant="outline"
          >
            サイトで見る
          </Button>
        )}
        {npmPackageName !== null && (
          <Button
            renderItem={({ className, children }) => (
              <a
                className={className}
                href={`https://www.npmjs.com/package/${npmPackageName}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {children}
              </a>
            )}
            size="sm"
            startIcon={<ExternalLinkIcon size="sm" />}
            variant="outline"
          >
            npmで見る
          </Button>
        )}
      </div>
    </div>
  </article>
);
