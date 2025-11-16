import { cn } from '@k8o/helpers';
import Link from 'next/link';
import type { FC } from 'react';
import { getBlogToc } from '@/app/blog/_api';

const LinkButton: FC<{
  depth: number;
  text: string;
}> = ({ depth, text }) => {
  return (
    <Link
      className={cn(
        'inline-block w-full rounded-md px-4 py-2 hover:bg-bg-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-info focus-visible:ring-offset-2',
        depth === 2 && 'pl-8 text-sm',
        depth === 3 && 'pl-12 text-xs',
      )}
      href={`#${text}`}
    >
      {text}
    </Link>
  );
};

export const TableOfContext: FC<{ slug: string }> = async ({ slug }) => {
  const headingTree = await getBlogToc(slug);

  if (headingTree.children.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg bg-bg-base/90">
      <div className="border-border-base border-b p-4 pb-2">
        <h3 className="font-bold text-lg text-primary-fg">目次</h3>
      </div>
      <ul className="flex flex-col p-2 text-fg-base text-sm">
        {headingTree.children.map((depth1) => {
          if (depth1.children.length === 0) {
            return (
              <li key={depth1.text}>
                <LinkButton depth={1} text={depth1.text} />
              </li>
            );
          }
          return (
            <li key={depth1.text}>
              <LinkButton depth={1} text={depth1.text} />
              <ul>
                {depth1.children.map((depth2) => {
                  if (depth2.children.length === 0) {
                    return (
                      <li key={depth2.text}>
                        <LinkButton depth={2} text={depth2.text} />
                      </li>
                    );
                  }
                  return (
                    <li key={depth2.text}>
                      <LinkButton depth={2} text={depth2.text} />
                      <ul>
                        {depth2.children.map((depth3) => {
                          return (
                            <li key={depth3.text}>
                              <LinkButton depth={3} text={depth3.text} />
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
