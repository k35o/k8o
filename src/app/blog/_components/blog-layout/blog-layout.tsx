import { FC, ReactNode } from 'react';

export const BlogLayout: FC<{
  children: ReactNode;
  updatedAt: string;
}> = ({ children, updatedAt }) => {
  return (
    <div className="flex flex-col gap-4">
      <article className="rounded-lg bg-bgBase px-1 py-14 pt-4 sm:px-10">
        <p className="text-end text-textDescription">
          {updatedAt}に公開
        </p>
        {children}
      </article>
    </div>
  );
};
