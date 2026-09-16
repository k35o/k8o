import NextImage from 'next/image';
import type { ComponentProps, FC } from 'react';

type Props = Omit<ComponentProps<typeof NextImage>, 'className'>;

export const Image: FC<Props> = (props) => (
  <figure className="vertical:max-w-container-lg mx-auto my-6 flex flex-col items-center gap-2">
    <NextImage
      className="bg-bg-subtle ring-border-subtle vertical:writing-h vertical:h-auto vertical:w-full rounded-lg shadow-xs ring-1"
      {...props}
    />
    {props.alt !== '' && (
      <figcaption
        // alt と同じ文を読み上げで二重にしない
        aria-hidden
        className="text-fg-mute text-center text-xs leading-relaxed"
      >
        {props.alt}
      </figcaption>
    )}
  </figure>
);

export const FloatImage: FC<Props> = (props) => (
  <div className="float-right ms-4">
    <Image {...props} />
  </div>
);
