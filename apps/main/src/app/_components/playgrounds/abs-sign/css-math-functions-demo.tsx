'use client';

import { Code, FormControl, Slider } from '@k8o/arte-odyssey';
import { useState } from 'react';

export function CssMathFunctionsDemo() {
  const [xValue, setXValue] = useState(-50);
  const [yValue, setYValue] = useState(30);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormControl
          helpText="横方向の位置を調整します"
          label="X値"
          renderInput={({ labelId: _, ...props }) => (
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
          renderInput={({ labelId: _, ...props }) => (
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
      <div className="flex flex-col items-center gap-4">
        <div className="border-border-base relative aspect-square w-full max-w-80 overflow-hidden border">
          {/* 中心線 */}
          <div className="bg-fg-subtle absolute top-0 left-1/2 h-full w-px" />
          <div className="bg-fg-subtle absolute top-1/2 left-0 h-px w-full" />
          {/* 移動する要素 */}
          <div
            className="absolute z-10 size-6 rounded-full transition-all duration-300 ease-out"
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

          {/* 座標表示 */}
          <div className="text-fg-mute absolute top-2 left-2 text-xs">
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
        <div className="text-fg-mute flex flex-col items-start gap-2 text-xs md:text-sm">
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
