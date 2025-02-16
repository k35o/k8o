'use client';

import { Breadcrumb } from '@/components/breadcrumb';
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
          >
            Quizzes
          </Breadcrumb.Link>
        </h2>
      </Breadcrumb.Item>
      {pathname.startsWith('/quizzes/fish-kanji') && (
        <>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <h3>
              <Breadcrumb.Link href="/quizzes/fish-kanji" current>
                うおへんクイズ
              </Breadcrumb.Link>
            </h3>
          </Breadcrumb.Item>
        </>
      )}
    </Breadcrumb.List>
  );
};
