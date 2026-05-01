import { cacheLife } from 'next/cache';

import { getArtifacts } from '@/features/artifacts/interface/queries';

import { fetchRepositoryCommitContributions } from '../infrastructure/contributions';

export type ContributionDay = Awaited<
  ReturnType<typeof fetchRepositoryCommitContributions>
>[number];

const USERNAME = 'k35o';
const OWNER = 'k35o';

function parseGitHubRepo(
  githubUrl: string,
): { owner: string; repo: string } | null {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+)/.exec(githubUrl);
  if (match?.[1] === undefined || match[2] === undefined) {
    return null;
  }
  return { owner: match[1], repo: match[2] };
}

function mergeContributions(results: ContributionDay[][]): ContributionDay[] {
  const mergedMap = new Map<string, ContributionDay>();
  for (const days of results) {
    for (const day of days) {
      const existing = mergedMap.get(day.date);
      mergedMap.set(day.date, {
        ...day,
        count: (existing?.count ?? 0) + day.count,
      });
    }
  }

  return Array.from(mergedMap.values()).toSorted((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export async function getRepositoryCommitContributions() {
  'use cache';
  cacheLife('minutes');

  const artifactRepos = getArtifacts()
    .map((artifact) => parseGitHubRepo(artifact.githubUrl))
    .filter((repo): repo is { owner: string; repo: string } => repo !== null);

  const repos = [{ owner: OWNER, repo: 'k8o' }, ...artifactRepos];

  const results = await Promise.all(
    repos.map(({ owner, repo }) =>
      fetchRepositoryCommitContributions(USERNAME, owner, repo),
    ),
  );

  return mergeContributions(results);
}
