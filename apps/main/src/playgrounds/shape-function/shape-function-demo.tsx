'use client';

import { FormControl, Slider } from '@k8ordo/ui';
import { useState } from 'react';

import styles from './shape-function-demo.module.css';

export function ShapeFunctionDemo() {
  const [width, setWidth] = useState(100);

  return (
    <div className={styles.root}>
      <FormControl
        label="幅"
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <Slider
            {...props}
            max={100}
            min={30}
            onChange={setWidth}
            value={width}
          />
        )}
      />

      <div className={styles.comparison}>
        <div className={styles.panel}>
          <p className={styles.heading}>path()</p>
          <div className={styles.frame} style={{ width: `${width}%` }}>
            <div
              className={styles.shape}
              style={{
                clipPath: "path('M 0 0 L 200 64 L 0 128 Z')",
              }}
            />
          </div>
          <p className={styles.note}>
            固定のピクセル値のため、幅を変えると三角形が崩れる
          </p>
        </div>

        <div className={styles.panel}>
          <p className={styles.heading}>shape()</p>
          <div className={styles.frame} style={{ width: `${width}%` }}>
            <div
              className={styles.shape}
              style={{
                clipPath:
                  'shape(from 0% 0%, line to 100% 50%, line to 0% 100%, close)',
              }}
            />
          </div>
          <p className={styles.note}>
            パーセンテージのため、幅を変えても三角形を維持する
          </p>
        </div>
      </div>
    </div>
  );
}
