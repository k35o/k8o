import { cn } from '@k8o/helpers/cn';

export const TextTag = ({
  text,
  size = 'md',
  clickable = false,
}: {
  text: string;
  size?: 'sm' | 'md';
  clickable?: boolean;
}) => {
  return (
    <span
      className={cn(
        'inline-block rounded-full bg-bg-mute font-medium',
        clickable && 'cursor-pointer hover:bg-bg-emphasize',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
      )}
    >
      {text}
    </span>
  );
};
