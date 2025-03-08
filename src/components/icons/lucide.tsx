import { Direction } from '@/types';
import { cn } from '@/utils/cn';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';
import { FC, ReactNode } from 'react';

type IconProps = {
  size: 'sm' | 'md' | 'lg';
};

const BaseIcon: FC<
  IconProps & {
    renderItem: (arg: { className: string }) => ReactNode;
  }
> = ({ size, renderItem }) => {
  return renderItem({
    className: cn(
      size === 'sm' && 'size-4',
      size === 'md' && 'size-6',
      size === 'lg' && 'size-8',
    ),
  });
};

export const Chevron: FC<
  Partial<IconProps> & { direction: Direction }
> = ({ direction, size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        switch (direction) {
          case 'up':
            return <ChevronUp {...props} />;
          case 'down':
            return <ChevronDown {...props} />;
          case 'left':
            return <ChevronLeft {...props} />;
          case 'right':
            return <ChevronRight {...props} />;
        }
      }}
    />
  );
};
