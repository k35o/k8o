import { BaseIcon } from '@k8ordo/ui/icons';
import type { BaseIconProps } from '@k8ordo/ui/icons';
import type { FC } from 'react';

import styles from './twitter-icon.module.css';

export const TwitterIcon: FC<Partial<BaseIconProps>> = ({ size = 'md' }) => (
  <BaseIcon
    renderItem={(props) => (
      <svg
        {...props}
        fill="none"
        viewBox="0 0 1200 1227"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className={styles.mark}
          d="M714.16 519.28L1160.89 0H1055.03L667.14 450.89L357.33 0H0L468.49 681.82L0 1226.37H105.87L515.49 750.22L842.67 1226.37H1200L714.14 519.28H714.16ZM569.16 687.83L521.70 619.93L144.01 79.69H306.62L611.41 515.68L658.88 583.58L1055.08 1150.3H892.48L569.16 687.85V687.83Z"
        />
      </svg>
    )}
    size={size}
  />
);
