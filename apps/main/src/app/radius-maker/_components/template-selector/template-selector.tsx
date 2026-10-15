'use client';

import { SparklesIcon } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import type { RadiusCorners } from '../../_types/corner-radius';
import { RADIUS_PRESETS } from '../../_utils/presets';
import { cornersEqual, toBorderRadiusValue } from '../../_utils/radius-css';
import { generateBlobCorners } from '../../_utils/random-blob';

import styles from './template-selector.module.css';

type Props = {
  corners: RadiusCorners;
  onSelect: (corners: RadiusCorners) => void;
};

export const TemplateSelector: FC<Props> = ({ corners, onSelect }) => {
  const selectedName =
    RADIUS_PRESETS.find((preset) => cornersEqual(preset.corners, corners))
      ?.name ?? '';

  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>テンプレートから始める</legend>
      <div className={styles.chips}>
        {RADIUS_PRESETS.map((preset) => (
          <button
            aria-pressed={selectedName === preset.name}
            className={styles.chip}
            key={preset.name}
            onClick={() => {
              onSelect(preset.corners);
            }}
            type="button"
          >
            <span
              aria-hidden="true"
              className={styles.swatch}
              style={{ borderRadius: toBorderRadiusValue(preset.corners) }}
            />
            <span className={styles.chipLabel}>{preset.name}</span>
          </button>
        ))}
        <button
          className={cn(styles.chip, styles.random)}
          onClick={() => {
            onSelect(generateBlobCorners());
          }}
          type="button"
        >
          <span aria-hidden="true" className={styles.randomIcon}>
            <SparklesIcon />
          </span>
          <span className={styles.chipLabel}>ランダム</span>
        </button>
      </div>
    </fieldset>
  );
};
