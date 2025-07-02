import {
  Playground,
  playgroundSections,
} from '@/app/_components/playgrounds';
import { Anchor } from '@/components/anchor';
import { Card } from '@/components/card';
import { Heading } from '@/components/heading';

export default function PlaygroundsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Heading type="h1">Playgrounds</Heading>
        <p className="text-fg-mute mt-2">
          インタラクティブなWeb技術のデモ集。最新のWeb
          API、CSS機能、React技術を実際に体験できます。
        </p>
      </div>

      <div className="space-y-12">
        {playgroundSections.map((section) => (
          <Card key={section.id}>
            <div className="p-6">
              <div className="mb-6">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <Heading type="h2">{section.title}</Heading>
                </div>
                <p className="text-fg-mute mb-3">
                  {section.description}
                </p>
                {section.type === 'blog' && (
                  <Anchor href={`/blog/${section.slug}`}>
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
