import { Route } from 'next';
import Link from 'next/link';
import { Heading } from '../../../components/heading';
import { FC, PropsWithChildren } from 'react';

const Container: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="grid place-items-center gap-4 grid-cols-auto-fill-40">
      {children}
    </div>
  );
};

const Item: FC<{
  link: Route;
  emotion: string;
  title: string;
}> = ({ link, emotion, title }) => {
  return (
    <div className="size-40 rounded-xl bg-white shadow-md">
      <Link href={link} scroll={false}>
        <div className="flex flex-col items-center justify-center gap-2 p-4">
          <Heading type="h3">{title}</Heading>
          <div className="flex size-24 shrink-0 items-center justify-center rounded-lg text-7xl">
            {emotion}
          </div>
        </div>
      </Link>
    </div>
  );
};

export const ShowCase = {
  Container,
  Item,
};
