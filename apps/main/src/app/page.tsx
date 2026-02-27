import { Card } from '@k8o/arte-odyssey/card';
import { ErrorBoundary } from '@k8o/arte-odyssey/error-boundary';
import { Heading } from '@k8o/arte-odyssey/heading';
import { IconLink } from '@k8o/arte-odyssey/icon-link';
import { GitHubIcon, QiitaIcon, TwitterIcon } from '@k8o/arte-odyssey/icons';
import { TextTag } from '@k8o/arte-odyssey/text-tag';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { AppCard } from './_components/app-card';
import { EmailTooltip } from './_components/email-tooltip';
import { GitHubContributionGraph } from './_components/github-contribution-graph';
import { RecentBlogs } from './_components/recent-blogs';
import {
  assistItems,
  assistSection,
  forgeItems,
  forgeSection,
  profile,
} from './_constants/content';
import arteodyssey from './_images/arteodyssey.png';
import k8o from './_images/k8o.jpg';
import { RoundedIcon } from './radius-maker/_components/rounded-icon';

const forgeSymbols: Record<string, ReactNode> = {
  '/blog': '📕',
  '/talks': '🎙️',
  '/playgrounds': '👾',
  'https://arte-odyssey.k8o.me': (
    <Image alt="" className="size-16" loading="eager" src={arteodyssey} />
  ),
};

const assistSymbols: Record<string, ReactNode> = {
  '/moji-count': '📏',
  '/japanese-text-fixer': '🧐',
  '/qr-generator': '📱',
  '/base-converter': '🧬',
  '/contrast-checker': '⚖️',
  '/color-converter': '🎨',
  '/radius-maker': <RoundedIcon />,
  '/sql-table-builder': '🔨',
  '/quizzes': '💡',
  '/text-diff': '🔍',
};

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <Card>
        <div className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
            <Image
              alt="k8oのアイコン"
              className="size-24 rounded-md sm:size-32"
              height={128}
              src={k8o}
              width={128}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <Heading type="h3">{profile.name}</Heading>
                <div className="flex flex-wrap items-center gap-2">
                  <EmailTooltip />
                  <IconLink href="https://x.com/k8ome" label="Xのアカウント">
                    <TwitterIcon />
                  </IconLink>
                  <IconLink
                    href="https://github.com/k35o"
                    label="GitHubのアカウント"
                  >
                    <GitHubIcon />
                  </IconLink>
                  <IconLink
                    href="https://qiita.com/k8o"
                    label="Qiitaのアカウント"
                  >
                    <QiitaIcon />
                  </IconLink>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <TextTag size="sm" text="フロントエンド" />
                <TextTag size="sm" text="TypeScript" />
                <TextTag size="sm" text="デザイン" />
              </div>

              <p className="text-fg-mute text-sm leading-relaxed">
                {profile.description}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <div>
          <Heading type="h2">Activity</Heading>
        </div>
        <ErrorBoundary
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
        </ErrorBoundary>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <Heading type="h2">{forgeSection.title}</Heading>
          <p className="text-fg-mute text-sm">{forgeSection.description}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {forgeItems.map((item) => (
            <AppCard
              description={item.description}
              key={item.link}
              link={item.link}
              symbol={forgeSymbols[item.link]}
              title={item.title}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <Heading type="h2">{assistSection.title}</Heading>
          <p className="text-fg-mute text-sm">{assistSection.description}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {assistItems.map((item) => (
            <AppCard
              description={item.description}
              key={item.link}
              link={item.link}
              symbol={assistSymbols[item.link]}
              title={item.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
