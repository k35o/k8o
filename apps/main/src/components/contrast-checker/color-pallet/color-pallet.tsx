import { FormControl } from '@k8ordo/ui';
import type { ChangeEventHandler, FC } from 'react';

import styles from './color-pallet.module.css';

type Props = {
  label: string;
  color: string;
  setColor: (color: string) => void;
};

export const ColorPallet: FC<Props> = ({ label, color, setColor }) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setColor(e.target.value);
  };

  return (
    <FormControl
      label={label}
      renderInput={({ id }) => (
        <div className={styles.root}>
          <input
            aria-label={label}
            className={styles.input}
            id={id}
            onChange={handleChange}
            type="color"
            value={color}
          />
          <p className={styles.value}>{color}</p>
        </div>
      )}
    />
  );
};
