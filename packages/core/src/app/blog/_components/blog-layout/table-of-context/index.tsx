import Link from 'next/link';
import type { FC } from 'react';
import { getBlogToc } from '@/app/blog/_api';

export const TableOfContext: FC<{ slug: string }> = async ({ slug }) => {
  const headingTree = await getBlogToc(slug);

  if (headingTree.children.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-24 rounded-md bg-bg-base/90 p-4">
      <h3 className="font-bold text-fg-base text-lg">目次</h3>
      <ol className="list-inside list-decimal text-fg-base text-sm">
        {headingTree.children.map((depth1) => {
          if (depth1.children.length === 0) {
            return (
              <li className="pt-1" key={depth1.text}>
                <Link className="hover:underline" href={`#${depth1.text}`}>
                  {depth1.text}
                </Link>
              </li>
            );
          }
          return (
            <li className="pt-1" key={depth1.text}>
              <Link className="hover:underline" href={`#${depth1.text}`}>
                {depth1.text}
              </Link>
              <ol className="list-inside list-decimal pl-2">
                {depth1.children.map((depth2) => {
                  if (depth2.children.length === 0) {
                    return (
                      <li className="pt-1" key={depth2.text}>
                        <Link
                          className="hover:underline"
                          href={`#${depth2.text}`}
                        >
                          {depth2.text}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li className="pt-1" key={depth2.text}>
                      <Link
                        className="hover:underline"
                        href={`#${depth2.text}`}
                      >
                        {depth2.text}
                      </Link>
                      <ol className="list-inside list-decimal pl-4">
                        {depth2.children.map((depth3) => {
                          return (
                            <li className="pt-1" key={depth3.text}>
                              <Link
                                className="hover:underline"
                                href={`#${depth3.text}`}
                              >
                                {depth3.text}
                              </Link>
                            </li>
                          );
                        })}
                      </ol>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
