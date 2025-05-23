import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { PropsWithChildren } from 'react';

const slug = 'react19-usereducer-ts-type-inference';

export default function Layout({ children }: PropsWithChildren) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
