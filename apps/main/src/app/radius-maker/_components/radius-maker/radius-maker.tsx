'use client';

import {
  BaselineStatus,
  Card,
  FormControl,
  NumberField,
  Select,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

import {
  CORNER_SHAPE_LABELS,
  CORNER_SHAPES,
  type CornerShape,
} from '../../_types/corner-shape';
import { PREVIEW_SIZE } from '../../_utils/search-params';
import { CornerInputs } from '../corner-inputs';
import { OutputPanel } from '../output-panel';
import { RadiusCanvas } from '../radius-canvas';
import { TemplateSelector } from '../template-selector';
import { UiPreview } from '../ui-preview';
import { useRadiusState } from './use-radius-state';

const SHAPE_OPTIONS = CORNER_SHAPES.map((shape) => ({
  value: shape,
  label: CORNER_SHAPE_LABELS[shape],
}));

const isCornerShape = (value: string): value is CornerShape =>
  (CORNER_SHAPES as readonly string[]).includes(value);

export const RadiusMaker: FC = () => {
  const {
    corners,
    width,
    height,
    shape,
    setCornerValue,
    setCorners,
    setWidth,
    setHeight,
    setShape,
  } = useRadiusState();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-6 p-5 sm:p-6">
          <RadiusCanvas
            corners={corners}
            height={height}
            onChangeValue={setCornerValue}
            shape={shape}
            width={width}
          />
          <OutputPanel corners={corners} shape={shape} />
          <TemplateSelector corners={corners} onSelect={setCorners} />
          <div className="grid gap-4 sm:grid-cols-3">
            <FormControl
              label="幅(px)"
              renderInput={(props) => (
                <NumberField
                  {...props}
                  max={PREVIEW_SIZE.max}
                  min={PREVIEW_SIZE.min}
                  onChange={setWidth}
                  value={width}
                />
              )}
            />
            <FormControl
              label="高さ(px)"
              renderInput={(props) => (
                <NumberField
                  {...props}
                  max={PREVIEW_SIZE.max}
                  min={PREVIEW_SIZE.min}
                  onChange={setHeight}
                  value={height}
                />
              )}
            />
            <FormControl
              label="かたち(corner-shape)"
              renderInput={(props) => (
                <Select
                  {...props}
                  onChange={(e) => {
                    if (isCornerShape(e.target.value)) {
                      setShape(e.target.value);
                    }
                  }}
                  options={SHAPE_OPTIONS}
                  value={shape}
                />
              )}
            />
          </div>
          {shape !== 'round' && <BaselineStatus featureId="corner-shape" />}
        </div>
      </Card>
      <div className="grid gap-6 sm:grid-cols-2 sm:items-start">
        <Card>
          <div className="flex flex-col gap-3 p-5">
            <p className="text-fg-base text-sm font-bold">数値で調整する</p>
            <CornerInputs corners={corners} onChangeValue={setCornerValue} />
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <UiPreview corners={corners} shape={shape} />
          </div>
        </Card>
      </div>
    </div>
  );
};
