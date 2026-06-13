'use client';

import { SparklesIcon } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import type { RadiusCorners } from '../../_types/corner-radius';
import { RADIUS_PRESETS } from '../../_utils/presets';
import { cornersEqual, toBorderRadiusValue } from '../../_utils/radius-css';
import { generateBlobCorners } from '../../_utils/random-blob';

const chipClass = (selected: boolean): string =>
  cn(
    'flex min-w-18 flex-col items-center gap-1.5 rounded-xl border px-3 pt-3 pb-2',
    'transition-colors duration-150 ease-out',
    'focus-visible:ring-border-info focus-visible:ring-2 focus-visible:outline-hidden',
    selected
      ? 'border-primary-border bg-primary-bg-subtle'
      : 'border-border-mute bg-bg-base hover:bg-bg-subtle',
  );

type Props = {
  corners: RadiusCorners;
  onSelect: (corners: RadiusCorners) => void;
};

export const TemplateSelector: FC<Props> = ({ corners, onSelect }) => {
  const selectedName =
    RADIUS_PRESETS.find((preset) => cornersEqual(preset.corners, corners))
      ?.name ?? '';

  return (
    <fieldset className="w-full">
      <legend className="text-fg-base mb-3 text-sm font-bold">
        テンプレートから始める
      </legend>
      <div className="flex flex-wrap gap-2">
        {RADIUS_PRESETS.map((preset) => (
          <button
            aria-pressed={selectedName === preset.name}
            className={chipClass(selectedName === preset.name)}
            key={preset.name}
            onClick={() => {
              onSelect(preset.corners);
            }}
            type="button"
          >
            <span
              aria-hidden="true"
              className="bg-primary-bg size-10"
              style={{ borderRadius: toBorderRadiusValue(preset.corners) }}
            />
            <span className="text-fg-base text-xs font-medium">
              {preset.name}
            </span>
          </button>
        ))}
        <button
          className={cn(chipClass(false), 'border-dashed')}
          onClick={() => {
            onSelect(generateBlobCorners());
          }}
          type="button"
        >
          <span
            aria-hidden="true"
            className="text-fg-mute flex size-10 items-center justify-center"
          >
            <SparklesIcon />
          </span>
          <span className="text-fg-base text-xs font-medium">ランダム</span>
        </button>
      </div>
    </fieldset>
  );
};
