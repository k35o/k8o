'use client';

import { Code, FormControl, Slider } from '@k8ordo/ui';
import { useState } from 'react';

import styles from './css-math-functions-demo.module.css';

export function CssMathFunctionsDemo() {
  const [xValue, setXValue] = useState(-50);
  const [yValue, setYValue] = useState(30);

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <FormControl
          helpText="横方向の位置を調整します"
          label="X値"
          renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
            <Slider
              {...props}
              max={100}
              min={-100}
              onChange={setXValue}
              value={xValue}
            />
          )}
        />
        <FormControl
          helpText="縦方向の位置を調整します"
          label="Y値"
          renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
            <Slider
              {...props}
              max={100}
              min={-100}
              onChange={setYValue}
              value={yValue}
            />
          )}
        />
      </div>
      <div className={styles.preview}>
        <div className={styles.plane}>
          <div className={styles.axisY} />
          <div className={styles.axisX} />
          <div
            className={styles.point}
            style={{
              '--x': xValue.toString(),
              '--y': yValue.toString(),
              backgroundColor:
                'hsl(calc(sign(var(--x) + var(--y)) * 80 + 200), 70%, 50%)',
              left: `${(50 + xValue / 2).toString()}%`,
              bottom: `${(50 + yValue / 2).toString()}%`,
              transform:
                'translate(-50%, 50%) scale(calc(1 + (abs(var(--x)) + abs(var(--y))) / 200))',
              opacity: 'calc(0.5 + (abs(var(--x)) + abs(var(--y))) / 200)',
            }}
          />

          <div className={styles.readout}>
            <p>
              座標: ({xValue}, {yValue})
            </p>
            <p>座標の絶対値の和: {Math.abs(xValue) + Math.abs(yValue)}</p>
            <p>
              象限:{' '}
              {xValue >= 0
                ? yValue >= 0
                  ? '第一象限'
                  : '第四象限'
                : yValue >= 0
                  ? '第二象限'
                  : '第三象限'}
            </p>
          </div>
        </div>
        <div className={styles.notes}>
          <p>
            ※<Code>abs</Code>
            を用いて、座標の絶対値の和が大きいほど要素のサイズを大きくしています。透明度も同じようにしています。
            <br />
            要素のサイズ:{' '}
            <Code>transform: scale(calc(1 + (abs(x) + abs(y)) / 200))</Code>
            <br />
            透明度: <Code>opacity: calc(0.5 + (abs(x) + abs(y)) / 200)</Code>
          </p>
          <p>
            ※<Code>sign</Code>
            を用いて、座標の点の色を変えています。座標の和が正であれば
            <Code>hsl(280, 70%, 50%)</Code>、負であれば
            <Code>hsl(120, 70%, 50%)</Code>、0であれば
            <Code>hsl(200, 70%, 50%)</Code>にしています。
            <br />
            座標の点の色:{' '}
            <Code>
              background-color: &apos;hsl(calc(sign(var(--x) + var(--y)) * 80 +
              200), 70%, 50%)&apos;
            </Code>
          </p>
        </div>
      </div>
    </div>
  );
}
