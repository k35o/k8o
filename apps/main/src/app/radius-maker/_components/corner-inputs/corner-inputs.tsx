'use client';

import { NumberField } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import { useId } from 'react';
import type { FC } from 'react';

import type { Axis, Corner, RadiusCorners } from '../../_types/corner-radius';
import {
  AXIS_LABELS,
  CORNER_COLOR_CLASSES,
  CORNER_LABELS,
} from '../../_utils/corner-meta';

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
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      {DISPLAY_ORDER.map((corner) => (
        <fieldset key={corner}>
          <legend className="text-fg-base mb-2 flex items-center gap-1.5 text-sm font-bold">
            <span
              aria-hidden="true"
              className={cn(
                'size-2.5 rounded-full',
                CORNER_COLOR_CLASSES[corner],
              )}
            />
            {CORNER_LABELS[corner]}
          </legend>
          <div className="flex flex-col gap-2">
            {AXES.map((axis) => (
              <div className="flex items-center gap-2" key={axis}>
                <label
                  className="text-fg-mute w-8 shrink-0 text-xs"
                  htmlFor={`${id}-${corner}-${axis}`}
                >
                  {AXIS_LABELS[axis]}
                </label>
                <NumberField
                  id={`${id}-${corner}-${axis}`}
                  max={100}
                  min={0}
                  onChange={(value) => {
                    onChangeValue(corner, axis, value);
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
