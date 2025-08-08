import type { FC } from 'react';

export const Typography: FC = () => {
  const sampleText =
    '国境の長いトンネルを抜けると雪国であった。夜の底が白くなった。信号所に汽車が止まった。';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-xl md:text-2xl">Font</h3>
        <div className="flex flex-col gap-4 rounded-md border border-border-base p-2">
          <div className="flex flex-col gap-2">
            <h4 className="font-bold font-noto-sans-jp text-lg md:text-xl">
              M PLUS 2
            </h4>
            <p className="line-clamp-1 font-m-plus-2">{sampleText}</p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold font-noto-sans-jp text-lg md:text-xl">
              Noto Sans Japanese
            </h4>
            <p className="line-clamp-1 font-noto-sans-jp">{sampleText}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-xl md:text-2xl">text</h3>
        <div className="flex flex-col gap-4 rounded-md border border-border-base p-2 md:gap-6">
          <div>
            <p className="text-xs md:hidden">k8o</p>
            <div className="flex items-end gap-2 text-fg-mute md:flex-col md:items-start md:gap-0">
              <h4 className="text-xl md:font-bold md:text-fg-base">xs</h4>
              <p className="text-sm md:text-xs">0.75rem(12px) 1.3333</p>
            </div>
          </div>
          <div>
            <p className="text-sm md:hidden">k8o</p>
            <div className="flex items-end gap-2 text-fg-mute md:flex-col md:items-start md:gap-0">
              <h4 className="text-xl md:font-bold md:text-fg-base">sm</h4>
              <p className="text-sm md:text-sm">0.875rem(14px) 1.4286</p>
            </div>
          </div>
          <div>
            <p className="text-md md:hidden">k8o</p>
            <div className="flex items-end gap-2 text-fg-mute md:flex-col md:items-start md:gap-0">
              <h4 className="text-xl md:font-bold md:text-fg-base">md</h4>
              <p className="text-sm md:text-md">1rem(16px) 1.5</p>
            </div>
          </div>
          <div>
            <p className="text-lg md:hidden">k8o</p>
            <div className="flex items-end gap-2 text-fg-mute md:flex-col md:items-start md:gap-0">
              <h4 className="text-xl md:font-bold md:text-fg-base">lg</h4>
              <p className="text-sm md:text-lg">1.125rem(18px) 1.5556</p>
            </div>
          </div>
          <div>
            <p className="text-xl md:hidden">k8o</p>
            <div className="flex items-end gap-2 text-fg-mute md:flex-col md:items-start md:gap-0">
              <h4 className="text-xl md:font-bold md:text-fg-base">xl</h4>
              <p className="text-sm md:text-xl">1.25rem(20px) 1.4</p>
            </div>
          </div>
          <div>
            <p className="text-2xl md:hidden">k8o</p>
            <div className="flex items-end gap-2 text-fg-mute md:flex-col md:items-start md:gap-0">
              <h4 className="text-xl md:font-bold md:text-fg-base">2xl</h4>
              <p className="text-sm md:text-2xl">1.5rem(24px) 1.3333</p>
            </div>
          </div>
          <div>
            <p className="text-3xl md:hidden">k8o</p>
            <div className="flex items-end gap-2 text-fg-mute md:flex-col md:items-start md:gap-0">
              <h4 className="text-xl md:font-bold md:text-fg-base">3xl</h4>
              <p className="text-sm md:text-3xl">1.875rem(30px) 1.2</p>
            </div>
          </div>
          <div>
            <p className="text-emphasize md:hidden">k8o</p>
            <div className="flex items-end gap-2 text-fg-mute md:flex-col md:items-start md:gap-0">
              <h4 className="text-xl md:font-bold md:text-fg-base">
                emphasize
              </h4>
              <p className="text-sm md:text-emphasize">3rem(48px) 1</p>
            </div>
          </div>
          <div>
            <p className="text-highlight md:hidden">k8o</p>
            <div className="flex items-end gap-2 text-fg-mute md:flex-col md:items-start md:gap-0">
              <h4 className="text-xl md:font-bold md:text-fg-base">
                highlight
              </h4>
              <p className="text-sm md:text-highlight">6rem(96px) 1</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-xl md:text-2xl">weight</h3>
        <div className="flex flex-col gap-4 rounded-md border border-border-base p-2">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg md:text-xl">medium(450)</h4>
            <p className="font-medium">{sampleText}</p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-lg md:text-xl">bold(700)</h4>
            <p className="font-bold">{sampleText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
