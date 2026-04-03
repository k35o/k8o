import { Anchor, Card, Heading } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import Link from 'next/link';
import { Playground, playgroundSections } from '@/app/_components/playgrounds';

export default function PlaygroundsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Heading type="h1">Playgrounds</Heading>
      </div>

      <div className="space-y-12">
        {playgroundSections.map((section) => (
          <Card key={section.id}>
            <div className="p-6">
              <div className="mb-6">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <Heading type="h2">{section.title}</Heading>
                </div>
                <p className="mb-3 text-fg-mute">{section.description}</p>
                {section.type === 'blog' && (
                  <Anchor
                    href={`/blog/${section.slug}` as Route}
                    renderAnchor={(props) => <Link {...props} />}
                  >
                    ブログを読む
                  </Anchor>
                )}
              </div>
              <div className="space-y-6">
                {section.demos.map((demo) => {
                  const DemoComponent = demo.component;
                  return (
                    <Playground key={demo.title} title={demo.title}>
                      <DemoComponent />
                    </Playground>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
