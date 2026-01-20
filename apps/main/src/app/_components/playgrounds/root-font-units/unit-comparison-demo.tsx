'use client';

const SCALE = 4;

export function UnitComparisonDemo() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 font-bold text-fg-base text-sm">
          幅を測る単位（rch, ric）
        </p>

        <div className="flex gap-12">
          <div className="flex flex-col items-start gap-1">
            <span style={{ fontSize: `${SCALE}rem`, lineHeight: 1 }}>水</span>
            <div
              className="rounded bg-primary-fg"
              style={{
                width: `${SCALE}ric`,
                height: '8px',
              }}
            />
            <span className="font-mono text-fg-mute text-xs">1ric</span>
          </div>

          <div className="flex flex-col items-start gap-1">
            <span style={{ fontSize: `${SCALE}rem`, lineHeight: 1 }}>0</span>
            <div
              className="rounded bg-primary-fg"
              style={{
                width: `${SCALE}rch`,
                height: '8px',
              }}
            />
            <span className="font-mono text-fg-mute text-xs">1rch</span>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 font-bold text-fg-base text-sm">
          高さを測る単位（rcap, rex）
        </p>

        <div className="flex gap-12">
          <div className="flex items-baseline gap-0.5">
            <span style={{ fontSize: `${SCALE}rem`, lineHeight: 1 }}>H</span>
            <div
              className="rounded bg-primary-fg"
              style={{
                width: '8px',
                height: `${SCALE}rcap`,
              }}
            />
            <span
              className="font-mono text-fg-mute text-xs"
              style={{ writingMode: 'vertical-rl' }}
            >
              1rcap
            </span>
          </div>

          <div className="flex items-baseline gap-0.5">
            <span style={{ fontSize: `${SCALE}rem`, lineHeight: 1 }}>x</span>
            <div
              className="rounded bg-primary-fg"
              style={{
                width: '8px',
                height: `${SCALE}rex`,
              }}
            />
            <span
              className="font-mono text-fg-mute text-xs"
              style={{ writingMode: 'vertical-rl' }}
            >
              1rex
            </span>
          </div>
        </div>
      </div>

      <p className="text-fg-mute text-sm">
        文字と単位バーをそれぞれ{SCALE}倍にしたものを表示しています。
        <br />
        1ricは「水」の幅、1rch は「0」の幅、1rcap
        は大文字Hの高さ、1rexは小文字xの高さです。
      </p>
    </div>
  );
}
