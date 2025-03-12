import { FC } from 'react';

export const Typography: FC = () => {
  const sampleText =
    '国境の長いトンネルを抜けると雪国であった。夜の底が白くなった。信号所に汽車が止まった。';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold">Font</h3>
        <div className="border-border-base flex flex-col gap-4 rounded-md border p-2">
          <div className="flex flex-col gap-2">
            <h4 className="font-noto-sans-jp text-xl font-bold">
              M PLUS 2
            </h4>
            <p className="font-m-plus-2 line-clamp-1">{sampleText}</p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-noto-sans-jp text-xl font-bold">
              Noto Sans Japanese
            </h4>
            <p className="font-noto-sans-jp line-clamp-1">
              {sampleText}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold">text</h3>
        <div className="border-border-base flex flex-col gap-4 rounded-md border p-2 md:gap-6">
          <div>
            <p className="text-xs md:hidden">k8o</p>
            <div className="text-fg-mute flex items-end gap-2 md:flex-col md:items-start md:gap-0">
              <h4 className="md:text-fg-base text-xl md:font-bold">
                xs
              </h4>
              <p className="text-sm md:text-xs">
                0.75rem(12px) 1.3333
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm md:hidden">k8o</p>
            <div className="text-fg-mute flex items-end gap-2 md:flex-col md:items-start md:gap-0">
              <h4 className="md:text-fg-base text-xl md:font-bold">
                sm
              </h4>
              <p className="text-sm md:text-sm">
                0.875rem(14px) 1.4286
              </p>
            </div>
          </div>
          <div>
            <p className="text-md md:hidden">k8o</p>
            <div className="text-fg-mute flex items-end gap-2 md:flex-col md:items-start md:gap-0">
              <h4 className="md:text-fg-base text-xl md:font-bold">
                md
              </h4>
              <p className="md:text-md text-sm">1rem(16px) 1.5</p>
            </div>
          </div>
          <div>
            <p className="text-lg md:hidden">k8o</p>
            <div className="text-fg-mute flex items-end gap-2 md:flex-col md:items-start md:gap-0">
              <h4 className="md:text-fg-base text-xl md:font-bold">
                lg
              </h4>
              <p className="text-sm md:text-lg">
                1.125rem(18px) 1.5556
              </p>
            </div>
          </div>
          <div>
            <p className="text-xl md:hidden">k8o</p>
            <div className="text-fg-mute flex items-end gap-2 md:flex-col md:items-start md:gap-0">
              <h4 className="md:text-fg-base text-xl md:font-bold">
                xl
              </h4>
              <p className="text-sm md:text-xl">1.25rem(20px) 1.4</p>
            </div>
          </div>
          <div>
            <p className="text-2xl md:hidden">k8o</p>
            <div className="text-fg-mute flex items-end gap-2 md:flex-col md:items-start md:gap-0">
              <h4 className="md:text-fg-base text-xl md:font-bold">
                2xl
              </h4>
              <p className="text-sm md:text-2xl">
                1.5rem(24px) 1.3333
              </p>
            </div>
          </div>
          <div>
            <p className="text-3xl md:hidden">k8o</p>
            <div className="text-fg-mute flex items-end gap-2 md:flex-col md:items-start md:gap-0">
              <h4 className="md:text-fg-base text-xl md:font-bold">
                3xl
              </h4>
              <p className="text-sm md:text-3xl">
                1.875rem(30px) 1.2
              </p>
            </div>
          </div>
          <div>
            <p className="text-emphasize md:hidden">k8o</p>
            <div className="text-fg-mute flex items-end gap-2 md:flex-col md:items-start md:gap-0">
              <h4 className="md:text-fg-base text-xl md:font-bold">
                emphasize
              </h4>
              <p className="md:text-emphasize text-sm">
                3rem(48px) 1
              </p>
            </div>
          </div>
          <div>
            <p className="text-highlight md:hidden">k8o</p>
            <div className="text-fg-mute flex items-end gap-2 md:flex-col md:items-start md:gap-0">
              <h4 className="md:text-fg-base text-xl md:font-bold">
                highlight
              </h4>
              <p className="md:text-highlight text-sm">
                6rem(96px) 1
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold">weight</h3>
        <div className="border-border-base flex flex-col gap-4 rounded-md border p-2">
          <div className="flex flex-col gap-2">
            <h4 className="text-xl">medium(450)</h4>
            <p className="font-medium">{sampleText}</p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-bold">bold(700)</h4>
            <p className="font-bold">{sampleText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
