import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

const slug = 'react19-usereducer-ts-type-inference';

export default function Layout({ children }: PropsWithChildren) {
  if (process.env.VERCEL_ENV === 'production') {
    notFound();
  }
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
