'use client';

import { Badge, Button, Heading, Stack } from '@k8ordo/ui';
import { ExternalLinkIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

import { GitHubIcon } from '@/components/site/brand-icons/github-icon';

import type { Artifact } from '../artifacts/artifacts';

import styles from './artifact-card.module.css';

export const ArtifactCard: FC<Artifact> = ({
  name,
  description,
  githubUrl,
  websiteUrl,
  npmPackageName,
  tags,
}) => (
  <article className={styles.root}>
    <Stack gap="sm">
      <Heading level="h3">{name}</Heading>
      <p className={styles.description}>{description}</p>
    </Stack>

    <div className={styles.footer}>
      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag) => (
            <Badge key={tag} size="sm" label={tag} />
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Button
          renderItem={({
            children,
            disabled: _disabled,
            type: _type,
            ...props
          }) => (
            <a
              href={githubUrl}
              rel="noopener noreferrer"
              target="_blank"
              {...props}
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
            renderItem={({
              children,
              disabled: _disabled,
              type: _type,
              ...props
            }) => (
              <a
                href={websiteUrl}
                rel="noopener noreferrer"
                target="_blank"
                {...props}
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
            renderItem={({
              children,
              disabled: _disabled,
              type: _type,
              ...props
            }) => (
              <a
                href={`https://www.npmjs.com/package/${npmPackageName}`}
                rel="noopener noreferrer"
                target="_blank"
                {...props}
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
