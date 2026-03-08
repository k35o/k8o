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
      className={`overflow-hidden rounded-md bg-bg-mute ${isArc ? 'mx-auto max-w-48' : ''}`}
    >
      <div
        className={`h-32 bg-linear-to-br from-group-primary to-group-quaternary ${styles[type]}`}
      />
    </div>
  );
};
