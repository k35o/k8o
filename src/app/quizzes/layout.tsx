import { PropsWithChildren } from 'react';
import { QuizBreadcrumb } from './_components/quiz-breadcrumb';

export const metadata = {
  title: 'Quizzes',
  description: '色々なジャンルのクイズを出します',
  openGraph: {
    title: 'Quizzes',
    description: '色々なジャンルのクイズを出します',
    url: 'https://k8o.me/quizzes',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Quizzes',
    card: 'summary',
    description: '色々なジャンルのクイズを出します',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-8">
      <QuizBreadcrumb />
      {children}
    </div>
  );
}
