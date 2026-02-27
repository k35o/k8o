import type { Metadata } from 'next';
import { QuizBreadcrumb } from './_components/quiz-breadcrumb';

export const metadata = {
  title: 'Quizzes',
  description: 'いろいろなジャンルの知識をクイズで試せます。',
  openGraph: {
    title: 'Quizzes',
    description: 'いろいろなジャンルの知識をクイズで試せます。',
    url: 'https://k8o.me/quizzes',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Quizzes',
    card: 'summary',
    description: 'いろいろなジャンルの知識をクイズで試せます。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/quizzes'>) {
  return (
    <div className="flex h-full flex-col gap-8">
      <QuizBreadcrumb />
      {children}
    </div>
  );
}
