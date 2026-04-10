import { Anchor } from '@k8o/arte-odyssey';
import { getBaselineFeatures, getFeatureBlogMap } from './_api';
import { BaselineFeatureList } from './_components';

export default async function BaselinePage() {
  const [features, blogMap] = await Promise.all([
    getBaselineFeatures(),
    getFeatureBlogMap(),
  ]);

  const latestYear = features[0]?.date.slice(0, 4) ?? '2026';

  return (
    <div className="flex flex-col gap-6">
      <BaselineFeatureList
        blogMap={blogMap}
        currentYear={latestYear}
        features={features}
      />
      <p className="text-fg-mute text-xs">
        Source:{' '}
        <Anchor href="https://webstatus.dev" openInNewTab>
          Web Platform Status
        </Anchor>
      </p>
    </div>
  );
}
