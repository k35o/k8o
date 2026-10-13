import { cn } from '@repo/helpers/cn';

import styles from './shape-command-demo.module.css';

type ShapeCommandType =
  | 'line'
  | 'curve'
  | 'smooth'
  | 'arc'
  | 'arc-large'
  | 'arc-rotate'
  | 'move';

export const ShapeCommandDemo = ({ type }: { type: ShapeCommandType }) => {
  const isArc = type.startsWith('arc');
  return (
    <div
      className={cn(
        'bg-bg-mute overflow-hidden rounded-md',
        isArc && 'mx-auto max-w-48',
      )}
    >
      <div
        className={cn(
          'from-group-primary to-group-quaternary h-32 bg-linear-to-br',
          styles[type],
        )}
      />
    </div>
  );
};
