'use client';

import { Code } from '@/components/code';
import { FormControl } from '@/components/form/form-control/form-control';
import { RangeField } from '@/components/form/range-field/range-field';
import { useState } from 'react';

export function CssMathFunctionsDemo() {
  const [xValue, setXValue] = useState(-50);
  const [yValue, setYValue] = useState(30);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormControl
          label="X値"
          helpText="横方向の位置を調整します"
          renderInput={({ labelId: _, ...props }) => (
            <RangeField
              {...props}
              value={xValue}
              onChange={setXValue}
              min={-100}
              max={100}
              unit="px"
            />
          )}
        />
        <FormControl
          label="Y値"
          helpText="縦方向の位置を調整します"
          renderInput={({ labelId: _, ...props }) => (
            <RangeField
              {...props}
              value={yValue}
              onChange={setYValue}
              min={-100}
              max={100}
              unit="px"
            />
          )}
        />
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="border-border-base relative aspect-square w-full max-w-80 overflow-hidden border">
          {/* 中心線 */}
          <div className="bg-fg-subtle absolute left-1/2 top-0 h-full w-px"></div>
          <div className="bg-fg-subtle absolute left-0 top-1/2 h-px w-full"></div>
          {/* 移動する要素 */}
          <div
            className="absolute z-10 h-6 w-6 rounded-full transition-all duration-300 ease-out"
            style={{
              '--x': xValue.toString(),
              '--y': yValue.toString(),
              backgroundColor:
                'hsl(calc(sign(var(--x) + var(--y)) * 80 + 200), 70%, 50%)',
              left: `${(50 + xValue / 2).toString()}%`,
              bottom: `${(50 + yValue / 2).toString()}%`,
              transform:
                'translate(-50%, 50%) scale(calc(1 + (abs(var(--x)) + abs(var(--y))) / 200))',
              opacity:
                'calc(0.5 + (abs(var(--x)) + abs(var(--y))) / 200)',
            }}
          ></div>

          {/* 座標表示 */}
          <div className="text-fg-mute absolute left-2 top-2 text-xs">
            <p>
              座標: ({xValue}, {yValue})
            </p>
            <p>
              座標の絶対値の和: {Math.abs(xValue) + Math.abs(yValue)}
            </p>
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
            <Code>
              transform: scale(calc(1 + (abs(x) + abs(y)) / 200))
            </Code>
            <br />
            透明度:{' '}
            <Code>opacity: calc(0.5 + (abs(x) + abs(y)) / 200)</Code>
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
              background-color: 'hsl(calc(sign(var(--x) + var(--y)) *
              80 + 200), 70%, 50%)'
            </Code>
          </p>
        </div>
      </div>
    </div>
  );
}
