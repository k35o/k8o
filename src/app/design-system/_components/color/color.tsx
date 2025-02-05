import { cn } from '@/utils/cn';
import { Heading } from '@/components/heading';
import { FC } from 'react';
import { calcContrast } from '@/utils/color/calc_contrast';
import { ColorInfo } from './color-info';
import { COLOR_VARIANTS } from '../../_utils/color';

export const Color: FC = () => {
  return (
    <section className="text-fg-base flex flex-col gap-4">
      <Heading type="h2">Color Token</Heading>
      <div className="bg-bg-base flex flex-col justify-between gap-1 rounded-xl p-3">
        <Heading type="h3">Neutral Color</Heading>
        <p className="text-fg-mute text-sm">
          グレースケールを元にした色、理由がない限りこの色を利用する
        </p>
        <div className="flex flex-col gap-6 p-2">
          <div className="flex flex-col gap-3">
            <Heading type="h4">Foreground Color</Heading>
            <div className="flex flex-col gap-5">
              <ColorInfo
                name="base"
                code="gray.900"
                codeDark="gray.50"
                variant="foreground"
              />
              <ColorInfo
                name="subtle"
                code="gray.400"
                codeDark="gray.500"
                variant="foreground"
              />
              <ColorInfo
                name="mute"
                code="gray.700"
                codeDark="gray.300"
                variant="foreground"
              />
              <ColorInfo
                name="inverse"
                code="gray.50"
                codeDark="gray.900"
                variant="foreground"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Heading type="h4">Background Color</Heading>
            <div className="flex flex-col gap-5">
              <ColorInfo
                name="base"
                code="white"
                codeDark="gray.900"
                variant="background"
              />
              <ColorInfo
                name="subtle"
                code="gray.100"
                codeDark="gray.800"
                variant="background"
              />
              <ColorInfo
                name="mute"
                code="gray.200"
                codeDark="gray.700"
                variant="background"
              />
              <ColorInfo
                name="emphasize"
                code="gray.300"
                codeDark="gray.600"
                variant="background"
              />
              <ColorInfo
                name="inverse"
                code="gray.900"
                codeDark="white"
                variant="background"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Heading type="h4">Border Color</Heading>
            <div className="flex flex-col gap-5">
              <ColorInfo
                name="base"
                code="gray.400"
                codeDark="gray.600"
                variant="border"
              />
              <ColorInfo
                name="subtle"
                code="gray.100"
                codeDark="gray.900"
                variant="border"
              />
              <ColorInfo
                name="mute"
                code="gray.200"
                codeDark="gray.800"
                variant="border"
              />
              <ColorInfo
                name="emphasize"
                code="gray.500"
                codeDark="gray.500"
                variant="border"
              />
              <ColorInfo
                name="inverse"
                code="gray.700"
                codeDark="gray.300"
                variant="border"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-bg-base flex flex-col justify-between gap-1 rounded-xl p-3">
        <Heading type="h3">Primitive Color</Heading>
        <p className="text-fg-mute text-sm">
          情緒的な役割を持つ色、強調やアクセントに利用する
        </p>
        <div className="flex flex-col gap-6 p-2">
          <div className="flex flex-col gap-4">
            <Heading type="h4">Primary</Heading>
            <div className="flex flex-col gap-5">
              <ColorInfo
                name="fg"
                code="teal.700"
                codeDark="teal.300"
                variant="foreground"
              />
              <ColorInfo
                name="bg"
                code="teal.600"
                codeDark="teal.600"
                variant="background"
              />
              <ColorInfo
                name="bg subtle"
                code="teal.100"
                codeDark="teal.900"
                variant="background"
              />
              <ColorInfo
                name="bg mute"
                code="teal.200"
                codeDark="teal.800"
                variant="background"
              />
              <ColorInfo
                name="bg emphasize"
                code="teal.300"
                codeDark="teal.700"
                variant="background"
              />
              <ColorInfo
                name="border"
                code="teal.600"
                codeDark="teal.600"
                variant="border"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Heading type="h4">Secondary</Heading>
            <div className="flex flex-col gap-5">
              <ColorInfo
                name="fg"
                code="cyan.700"
                codeDark="cyan.300"
                variant="foreground"
              />
              <ColorInfo
                name="bg"
                code="cyan.600"
                codeDark="cyan.600"
                variant="background"
              />
              <ColorInfo
                name="bg subtle"
                code="cyan.100"
                codeDark="cyan.900"
                variant="background"
              />
              <ColorInfo
                name="bg mute"
                code="cyan.200"
                codeDark="cyan.800"
                variant="background"
              />
              <ColorInfo
                name="bg emphasize"
                code="cyan.300"
                codeDark="cyan.700"
                variant="background"
              />
              <ColorInfo
                name="border"
                code="cyan.600"
                codeDark="cyan.600"
                variant="border"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-bg-base flex flex-col justify-between gap-3 rounded-xl p-3">
        <Heading type="h3">Semantic Color</Heading>
        <p className="text-fg-mute text-sm">
          機能的な役割を持つ色(情報、成功、警告、エラー)、利用者に色を用いて情報を届けたいときに利用する
        </p>
        <div className="flex flex-col gap-3 p-2">
          <div className="flex flex-col gap-3">
            <Heading type="h4">Foreground Color</Heading>
            <div className="flex flex-col gap-5">
              <ColorInfo
                name="info"
                code="blue.600"
                codeDark="blue.300"
                variant="foreground"
              />
              <ColorInfo
                name="success"
                code="green.600"
                codeDark="green.300"
                variant="foreground"
              />
              <ColorInfo
                name="warning"
                code="yellow.600"
                codeDark="yellow.300"
                variant="foreground"
              />
              <ColorInfo
                name="error"
                code="red.600"
                codeDark="red.300"
                variant="foreground"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3">
            <Heading type="h4">Background Color</Heading>
            <div className="flex flex-col gap-5">
              <ColorInfo
                name="info"
                code="blue.100"
                codeDark="blue.900"
                variant="background"
              />
              <ColorInfo
                name="success"
                code="green.100"
                codeDark="green.900"
                variant="background"
              />
              <ColorInfo
                name="warning"
                code="yellow.100"
                codeDark="yellow.900"
                variant="background"
              />
              <ColorInfo
                name="error"
                code="red.100"
                codeDark="red.900"
                variant="background"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3">
            <Heading type="h4">Border Color</Heading>
            <div className="flex flex-col gap-5">
              <ColorInfo
                name="info"
                code="blue.500"
                codeDark="blue.400"
                variant="border"
              />
              <ColorInfo
                name="success"
                code="green.500"
                codeDark="green.400"
                variant="border"
              />
              <ColorInfo
                name="warning"
                code="yellow.500"
                codeDark="yellow.400"
                variant="border"
              />
              <ColorInfo
                name="error"
                code="red.500"
                codeDark="red.400"
                variant="border"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-bg-base flex flex-col justify-between gap-1 rounded-xl p-3">
        <Heading type="h3">Base Color</Heading>
        <p className="text-fg-mute text-sm">
          デザインシステム全体で利用する基本色
        </p>
        <div className="flex flex-col gap-3">
          {Object.entries(COLOR_VARIANTS).map((value) => {
            return (
              <div
                key={value[0]}
                className="flex flex-col justify-between gap-3 rounded-xl p-3"
              >
                <Heading type="h4">{value[0]}</Heading>
                {typeof value[1] === 'string' ? (
                  <div className="dark flex flex-col items-center gap-1">
                    <div
                      className="border-border-base flex h-12 w-24 items-center justify-center rounded-4xl border"
                      style={{
                        backgroundColor: value[1],
                      }}
                    />
                    <p className="text-xs">{value[0]}</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-between gap-2">
                    {Object.entries(value[1]).map((color) => {
                      return (
                        <div
                          key={color[0]}
                          className="flex flex-col items-center gap-2"
                        >
                          <div
                            className={cn(
                              'border-border-base flex h-12 w-24 items-center justify-center rounded-4xl border',
                              calcContrast(
                                color[1],
                                COLOR_VARIANTS.white,
                              ) < 4.5
                                ? 'text-fg-base'
                                : 'text-fg-inverse',
                            )}
                            style={{
                              backgroundColor: color[1],
                            }}
                          >
                            {color[1]}
                          </div>
                          <p className="text-xs">{color[0]}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
