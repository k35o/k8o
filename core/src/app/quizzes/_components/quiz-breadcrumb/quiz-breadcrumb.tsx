'use client';

import { Anchor } from '@k8o/arte-odyssey/anchor';
import { Breadcrumb } from '@k8o/arte-odyssey/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

export const QuizBreadcrumb: FC = () => {
  const pathname = usePathname();

  return (
    <Breadcrumb.List size="lg">
      <Breadcrumb.Item>
        <h2>
          <Breadcrumb.Link
            href="/quizzes"
            current={pathname === '/quizzes'}
            component={Link}
          >
            Quizzes
          </Breadcrumb.Link>
        </h2>
      </Breadcrumb.Item>
      {pathname.startsWith('/quizzes/fish-kanji') && (
        <>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <h3 className="flex gap-1">
              {pathname.endsWith('/quizzes/fish-kanji') ? (
                <>
                  <Breadcrumb.Link
                    href="/quizzes/fish-kanji"
                    current
                    component={Link}
                  >
                    うおへんクイズ
                  </Breadcrumb.Link>
                  <div className="text-fg-base font-normal">
                    (
                    <Anchor
                      href="/quizzes/fish-kanji/list"
                      renderAnchor={(props) => <Link {...props} />}
                    >
                      問題一覧
                    </Anchor>
                    )
                  </div>
                </>
              ) : (
                <Breadcrumb.Link
                  href="/quizzes/fish-kanji"
                  component={Link}
                >
                  うおへんクイズ
                </Breadcrumb.Link>
              )}
            </h3>
          </Breadcrumb.Item>
        </>
      )}
      {pathname.startsWith('/quizzes/fish-kanji/list') && (
        <>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Link
              href="/quizzes/fish-kanji/list"
              current
              component={Link}
            >
              問題一覧
            </Breadcrumb.Link>
          </Breadcrumb.Item>
        </>
      )}
    </Breadcrumb.List>
  );
};
