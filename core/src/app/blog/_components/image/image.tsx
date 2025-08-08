import NextImage from 'next/image';
import type { ComponentProps, FC } from 'react';

type Props = {
  src: string;
  alt: string;
};

export const Image: FC<Props> = (props) => {
  return <NextImage className="py-2" {...props} />;
};

export const FloatImage: FC<ComponentProps<typeof Image>> = (props) => (
  <div className="float-right">
    <Image {...props} alt={props.alt} />
  </div>
);
