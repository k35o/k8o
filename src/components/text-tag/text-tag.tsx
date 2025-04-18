import { cn } from '@/utils/cn';

export const TextTag = ({
  text,
  color = 'base',
  size = 'md',
}: {
  text: string;
  color?: 'base' | 'white';
  size?: 'sm' | 'md';
}) => {
  return (
    <span
      className={cn(
        'inline-block rounded-full font-medium',
        color === 'base' && 'bg-bg-mute',
        color === 'white' && 'bg-bg-base',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
      )}
    >
      {text}
    </span>
  );
};
