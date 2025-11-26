'use client';

import { cn } from '@k8o/helpers/cn';
import Link from 'next/link';
import { type FC, useEffect, useState } from 'react';
import type { getBlogToc } from '@/app/blog/_api';

const LinkButton: FC<{
  depth: number;
  text: string;
  isActive: boolean;
}> = ({ depth, text, isActive }) => {
  return (
    <Link
      className={cn(
        'inline-block w-full rounded-md px-4 py-2 transition-colors hover:bg-bg-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-info focus-visible:ring-offset-2',
        depth === 2 && 'pl-8 text-sm',
        depth === 3 && 'pl-12 text-xs',
        isActive && 'xl:bg-primary-bg xl:font-bold xl:text-fg-base',
      )}
      href={`#${text}`}
    >
      {text}
    </Link>
  );
};

export const TableOfContext: FC<{
  headingTree: Awaited<ReturnType<typeof getBlogToc>>;
}> = ({ headingTree }) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      },
    );

    // すべての見出し要素を監視
    const headings = document.querySelectorAll('h2[id], h3[id], h4[id]');
    headings.forEach((heading) => {
      observer.observe(heading);
    });

    return () => observer.disconnect();
  }, []);

  if (headingTree.children.length === 0) {
    return null;
  }

  return (
    <div className="flex max-h-[80vh] flex-col rounded-lg bg-bg-base/90">
      <div className="border-border-base p-2 xl:border-b xl:p-4">
        <h3 className="font-bold text-lg text-primary-fg">目次</h3>
      </div>
      <ul className="flex flex-col overflow-y-auto p-2 text-fg-base text-sm">
        {headingTree.children.map((depth1) => {
          if (depth1.children.length === 0) {
            return (
              <li key={depth1.text}>
                <LinkButton
                  depth={1}
                  isActive={activeId === depth1.text}
                  text={depth1.text}
                />
              </li>
            );
          }
          return (
            <li key={depth1.text}>
              <LinkButton
                depth={1}
                isActive={activeId === depth1.text}
                text={depth1.text}
              />
              <ul>
                {depth1.children.map((depth2) => {
                  if (depth2.children.length === 0) {
                    return (
                      <li key={depth2.text}>
                        <LinkButton
                          depth={2}
                          isActive={activeId === depth2.text}
                          text={depth2.text}
                        />
                      </li>
                    );
                  }
                  return (
                    <li key={depth2.text}>
                      <LinkButton
                        depth={2}
                        isActive={activeId === depth2.text}
                        text={depth2.text}
                      />
                      <ul>
                        {depth2.children.map((depth3) => {
                          return (
                            <li key={depth3.text}>
                              <LinkButton
                                depth={3}
                                isActive={activeId === depth3.text}
                                text={depth3.text}
                              />
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
