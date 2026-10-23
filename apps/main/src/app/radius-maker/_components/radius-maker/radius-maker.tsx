'use client';

import { Card, FormControl, NumberField, Select } from '@k8ordo/ui';
import type { FC } from 'react';

import { BrowserSupportStatusLive } from '@/app/_components/browser-support-status/browser-support-status-live';
import type { BrowserSupportFeature } from '@/features/browser-support/interface/queries';

import { CORNER_SHAPE_LABELS, CORNER_SHAPES } from '../../_types/corner-shape';
import type { CornerShape } from '../../_types/corner-shape';
import { PREVIEW_SIZE } from '../../_utils/search-params';
import { CornerInputs } from '../corner-inputs';
import { OutputPanel } from '../output-panel';
import { RadiusCanvas } from '../radius-canvas';
import { TemplateSelector } from '../template-selector';
import { UiPreview } from '../ui-preview';
import { useRadiusState } from './use-radius-state';

import styles from './radius-maker.module.css';

const SHAPE_OPTIONS = CORNER_SHAPES.map((shape) => ({
  value: shape,
  label: CORNER_SHAPE_LABELS[shape],
}));

const isCornerShape = (value: string): value is CornerShape =>
  (CORNER_SHAPES as readonly string[]).includes(value);

export const RadiusMaker: FC<{
  cornerShapeStatus: BrowserSupportFeature | null;
}> = ({ cornerShapeStatus }) => {
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
    <div className={styles.root}>
      <Card>
        <div className={styles.editor}>
          <RadiusCanvas
            corners={corners}
            height={height}
            onChangeValue={setCornerValue}
            shape={shape}
            width={width}
          />
          <OutputPanel corners={corners} shape={shape} />
          <TemplateSelector corners={corners} onSelect={setCorners} />
          <div className={styles.sizeFields}>
            <FormControl
              label="幅(px)"
              renderInput={(props) => (
                <NumberField
                  {...props}
                  max={PREVIEW_SIZE.max}
                  min={PREVIEW_SIZE.min}
                  onChange={(value) => {
                    if (value !== null) setWidth(value);
                  }}
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
                  onChange={(value) => {
                    if (value !== null) setHeight(value);
                  }}
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
          {shape !== 'round' && (
            <BrowserSupportStatusLive
              feature={cornerShapeStatus}
              featureId="corner-shape"
            />
          )}
        </div>
      </Card>
      <div className={styles.panels}>
        <Card>
          <div className={styles.inputs}>
            <p className={styles.inputsTitle}>数値で調整する</p>
            <CornerInputs corners={corners} onChangeValue={setCornerValue} />
          </div>
        </Card>
        <Card>
          <div className={styles.preview}>
            <UiPreview corners={corners} shape={shape} />
          </div>
        </Card>
      </div>
    </div>
  );
};
