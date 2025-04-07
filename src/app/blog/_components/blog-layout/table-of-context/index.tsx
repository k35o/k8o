import { getBlogToc } from '#services/blog';
import Link from 'next/link';
import { FC } from 'react';

export const TableOfContext: FC<{ slug: string }> = async ({
  slug,
}) => {
  const headingTree = await getBlogToc(slug);

  if (headingTree.children.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-base/90 sticky top-24 rounded-md p-4">
      <h3 className="text-fg-base text-lg font-bold">目次</h3>
      <ol className="text-fg-base list-inside list-decimal text-sm">
        {headingTree.children.map((depth1) => {
          if (depth1.children.length === 0) {
            return (
              <li key={depth1.text} className="pt-1">
                <Link
                  href={`#${depth1.text}`}
                  className="hover:underline"
                >
                  {depth1.text}
                </Link>
              </li>
            );
          }
          return (
            <li key={depth1.text} className="pt-1">
              <Link
                href={`#${depth1.text}`}
                className="hover:underline"
              >
                {depth1.text}
              </Link>
              <ol className="list-inside list-decimal pl-2">
                {depth1.children.map((depth2) => {
                  if (depth2.children.length === 0) {
                    return (
                      <li key={depth2.text} className="pt-1">
                        <Link
                          href={`#${depth2.text}`}
                          className="hover:underline"
                        >
                          {depth2.text}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={depth2.text} className="pt-1">
                      <Link
                        href={`#${depth2.text}`}
                        className="hover:underline"
                      >
                        {depth2.text}
                      </Link>
                      <ol className="list-inside list-decimal pl-4">
                        {depth2.children.map((depth3) => {
                          return (
                            <li key={depth3.text} className="pt-1">
                              <Link
                                href={`#${depth3.text}`}
                                className="hover:underline"
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
