import { cacheLife } from 'next/cache';
import { getArtifacts } from '@/services/artifacts/artifacts';
import {
  type ContributionDay,
  fetchRepositoryCommitContributions,
} from '@/services/github/contributions';
import { Presenter } from './presenter';

const USERNAME = 'k35o';
const OWNER = 'k35o';

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

  return Array.from(mergedMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

function parseGitHubRepo(
  githubUrl: string,
): { owner: string; repo: string } | null {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+)/.exec(githubUrl);
  if (!(match?.[1] && match[2])) {
    return null;
  }
  return { owner: match[1], repo: match[2] };
}

export const GitHubContributionGraph = async () => {
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

  const days = mergeContributions(results);

  return <Presenter days={days} />;
};
