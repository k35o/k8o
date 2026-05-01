import { getRepositoryCommitContributions } from '@/features/github/interface/queries';

import { Presenter } from './presenter';

export const GitHubContributionGraph = async () => {
  const days = await getRepositoryCommitContributions();

  return <Presenter days={days} />;
};
