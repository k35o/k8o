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

const shapeStyles: Record<ShapeCommandType, string> = {
  line: styles.line,
  curve: styles.curve,
  smooth: styles.smooth,
  arc: styles.arc,
  'arc-large': styles.arcLarge,
  'arc-rotate': styles.arcRotate,
  move: styles.move,
};

export const ShapeCommandDemo = ({ type }: { type: ShapeCommandType }) => {
  const isArc = type.startsWith('arc');
  return (
    <div className={cn(styles.root, isArc && styles.narrow)}>
      <div className={cn(styles.shape, shapeStyles[type])} />
    </div>
  );
};
