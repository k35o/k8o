import { Heading } from '@k8o/arte-odyssey/heading';

export default function Layout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">Admin</Heading>
      {children}
    </div>
  );
}
