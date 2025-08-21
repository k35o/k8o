'use client';

import { Anchor } from '@k8o/arte-odyssey/anchor';
import { Breadcrumb } from '@k8o/arte-odyssey/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

export const QuizBreadcrumb: FC = () => {
  const pathname = usePathname();

  return (
    <Breadcrumb.List size="lg">
      <Breadcrumb.Item>
        <h2>
          <Breadcrumb.Link
            component={Link as FC<{ href: string; className: string }>}
            current={pathname === '/quizzes'}
            href="/quizzes"
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
                    component={Link as FC<{ href: string; className: string }>}
                    current
                    href="/quizzes/fish-kanji"
                  >
                    うおへんクイズ
                  </Breadcrumb.Link>
                  <div className="font-normal text-fg-base">
                    (
                    <Anchor
                      href="/quizzes/fish-kanji/list"
                      renderAnchor={(props) => (
                        <Link {...props} href="/quizzes/fish-kanji/list" />
                      )}
                    >
                      問題一覧
                    </Anchor>
                    )
                  </div>
                </>
              ) : (
                <Breadcrumb.Link
                  component={Link as FC<{ href: string; className: string }>}
                  href="/quizzes/fish-kanji"
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
              component={Link as FC<{ href: string; className: string }>}
              current
              href="/quizzes/fish-kanji/list"
            >
              問題一覧
            </Breadcrumb.Link>
          </Breadcrumb.Item>
        </>
      )}
    </Breadcrumb.List>
  );
};
