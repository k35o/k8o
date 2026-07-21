import { Heading, Separator } from '@k8o/arte-odyssey';
import Image from 'next/image';

import { EmailTooltip } from './_components/email-tooltip';
import { ActivityErrorBoundary } from './_components/error-boundary';
import { GitHubContributionGraph } from './_components/github-contribution-graph';
import { HomeJsonLd } from './_components/json-ld';
import { RecentBlogs } from './_components/recent-blogs';
import { SiteEntrySection } from './_components/site-entry-section';
import { SocialIcons } from './_components/social-icons';
import k8o from './_images/k8o.jpg';

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <HomeJsonLd />
      <div className="flex flex-col gap-12">
        <header className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-5 pt-2 lg:gap-x-10">
          <Image
            alt="k8oのアイコン"
            className="size-16 rounded-full lg:row-span-2 lg:size-32"
            height={128}
            src={k8o}
            width={128}
          />
          <div className="flex flex-col gap-3">
            <Heading type="h1">k8o</Heading>
            <div className="flex flex-wrap items-center gap-2">
              <SocialIcons />
              <EmailTooltip />
            </div>
          </div>

          <p className="text-fg-mute col-span-2 leading-relaxed lg:col-span-1 lg:col-start-2">
            Webフロントエンドを軸足に、最近は新しくブラウザで使えるようになった機能の深掘りをブログに残しています。
            デザインとの境界にも興味があり、デザインシステムArteOdysseyを育てています。
          </p>
        </header>

        <Separator color="subtle" />

        <div className="flex flex-col gap-6">
          <div>
            <Heading type="h2">Activity</Heading>
            <p className="text-fg-mute text-sm">
              最近の発信と、GitHubでの活動の記録。
            </p>
          </div>
          <ActivityErrorBoundary
            fallback={
              <div className="grid gap-8">
                <RecentBlogs />
              </div>
            }
          >
            <div className="grid items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:sticky lg:top-4">
                <GitHubContributionGraph />
              </div>
              <div className="md:col-span-2">
                <RecentBlogs />
              </div>
            </div>
          </ActivityErrorBoundary>
        </div>

        <SiteEntrySection kind="reading" />
        <SiteEntrySection kind="tool" />
      </div>
    </div>
  );
}
