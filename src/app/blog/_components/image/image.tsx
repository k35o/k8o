import NextImage from 'next/image';
import { FC } from 'react';

type Props = {
  src: string;
  alt: string;
};

export const Image: FC<Props> = (props) => {
  return <NextImage className="py-2" {...props} />;
};
