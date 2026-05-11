import NextImage from 'next/image';
import type { ComponentProps, FC } from 'react';

type Props = {
  src: string;
  alt: string;
};

export const Image: FC<Props> = (props) => (
  <div className="vertical:flex vertical:max-w-blog-image vertical:justify-center mx-auto py-2">
    <NextImage
      className="vertical:writing-h vertical:h-auto vertical:w-full"
      {...props}
    />
  </div>
);

export const FloatImage: FC<ComponentProps<typeof Image>> = (props) => (
  <div className="float-right">
    <Image {...props} alt={props.alt} />
  </div>
);
