import { slideMDXComponents } from '@/app/slides/_components/mdx-parts';
import Content from '@/content/slides/sample-deck/content.mdx';

export default function Page() {
  return <Content components={slideMDXComponents} />;
}
