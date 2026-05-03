import { getUserContributions } from '@/features/github/interface/queries';

import { Presenter } from './presenter';

export const GitHubContributionGraph = async () => {
  const days = await getUserContributions();

  return <Presenter days={days} />;
};
