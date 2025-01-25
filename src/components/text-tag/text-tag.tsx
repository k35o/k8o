import { cn } from '@/utils/cn';

export const TextTag = ({
  text,
  color = 'base',
}: {
  text: string;
  color?: 'base' | 'white';
}) => {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-sm font-medium',
        color === 'base' && 'bg-bg-secondary',
        color === 'white' && 'bg-bg-base',
      )}
    >
      {text}
    </span>
  );
};
