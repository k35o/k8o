import { Heading, IconLink, RSSIcon } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';
import { ContentContainer } from '@/app/_components/content-container';

export const metadata = {
  title: 'Readings',
  description: '気になっている記事を集めて、あとから探せるようにしています。',
  openGraph: {
    title: 'Readings',
    description: '気になっている記事を集めて、あとから探せるようにしています。',
    url: 'https://k8o.me/reading-list',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Readings',
    card: 'summary',
    description: '気になっている記事を集めて、あとから探せるようにしています。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/reading-list'>) {
  return (
    <ContentContainer>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Heading type="h2">Readings</Heading>
          <IconLink
            bg="base"
            href="/reading-list/feed"
            label="RSSフィード"
            openInNewTab
          >
            <RSSIcon />
          </IconLink>
        </div>
        {children}
      </div>
    </ContentContainer>
  );
}
