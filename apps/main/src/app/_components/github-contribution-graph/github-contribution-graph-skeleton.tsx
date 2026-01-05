/**
 * GitHub Contributionグラフのスケルトン
 */
export const GitHubContributionGraphSkeleton = () => {
  return (
    <div className="rounded-lg border-border-base bg-bg-base p-6">
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-bg-muted" />
      <div className="flex gap-1">
        {Array.from({ length: 53 }).map((_, weekIndex) => (
          <div className="flex flex-col gap-1" key={weekIndex}>
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div
                className="h-3 w-3 animate-pulse rounded-sm bg-bg-muted"
                key={dayIndex}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
