'use client';

import { NumberField } from '@k8ordo/ui';
import { useId } from 'react';
import type { FC } from 'react';

import type { Axis, Corner, RadiusCorners } from '../../_types/corner-radius';
import { AXIS_LABELS, CORNER_LABELS } from '../../_utils/corner-meta';

import styles from './corner-inputs.module.css';

const DISPLAY_ORDER: Corner[] = [
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
];

const AXES: Axis[] = ['x', 'y'];

type Props = {
  corners: RadiusCorners;
  onChangeValue: (corner: Corner, axis: Axis, value: number) => void;
};

export const CornerInputs: FC<Props> = ({ corners, onChangeValue }) => {
  const id = useId();

  return (
    <div className={styles.root}>
      {DISPLAY_ORDER.map((corner) => (
        <fieldset key={corner}>
          <legend className={styles.legend}>
            <span
              aria-hidden="true"
              className={styles.dot}
              data-corner={corner}
            />
            {CORNER_LABELS[corner]}
          </legend>
          <div className={styles.axes}>
            {AXES.map((axis) => (
              <div className={styles.axis} key={axis}>
                <label
                  className={styles.axisLabel}
                  htmlFor={`${id}-${corner}-${axis}`}
                >
                  {AXIS_LABELS[axis]}
                </label>
                <NumberField
                  id={`${id}-${corner}-${axis}`}
                  max={100}
                  min={0}
                  onChange={(value) => {
                    if (value !== null) onChangeValue(corner, axis, value);
                  }}
                  value={corners[corner][axis]}
                />
              </div>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
};
