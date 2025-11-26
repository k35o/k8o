import { Heading } from '@k8o/arte-odyssey/heading';
import { cn } from '@repo/helpers/cn';
import { calcContrast } from '@repo/helpers/color/calc-contrast';
import type { FC } from 'react';
import { COLOR_VARIANTS, SEMANTIC_COLOR_VARIANTS } from '../../_utils/color';
import { ColorInfo } from './color-info';

export const Color: FC = () => {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-1">
        <Heading type="h3">Neutral Color</Heading>
        <p className="text-fg-mute text-sm">
          グレースケールを元にした色、理由がない限りこの色を利用する
        </p>
        <div className="flex flex-col gap-6 p-2">
          <div className="flex flex-col gap-3">
            <Heading type="h4">Foreground Color</Heading>
            <div className="grid grid-cols-auto-fill-70 gap-5">
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.fg.base.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.fg.base.dark}
                name="base"
                variant="foreground"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.fg.subtle.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.fg.subtle.dark}
                name="subtle"
                variant="foreground"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.fg.mute.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.fg.mute.dark}
                name="mute"
                variant="foreground"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.fg.inverse.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.fg.inverse.dark}
                name="inverse"
                variant="foreground"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Heading type="h4">Background Color</Heading>
            <div className="grid grid-cols-auto-fill-70 gap-5">
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.bg.base.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.bg.base.dark}
                name="base"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.bg.subtle.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.bg.subtle.dark}
                name="subtle"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.bg.mute.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.bg.mute.dark}
                name="mute"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.bg.emphasize.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.bg.emphasize.dark}
                name="emphasize"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.bg.inverse.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.bg.inverse.dark}
                name="inverse"
                variant="background"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Heading type="h4">Border Color</Heading>
            <div className="grid grid-cols-auto-fill-70 gap-5">
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.border.base.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.border.base.dark}
                name="base"
                variant="border"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.border.subtle.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.border.subtle.dark}
                name="subtle"
                variant="border"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.border.mute.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.border.mute.dark}
                name="mute"
                variant="border"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.border.emphasize.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.border.emphasize.dark}
                name="emphasize"
                variant="border"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.base.border.inverse.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.base.border.inverse.dark}
                name="inverse"
                variant="border"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-1">
        <Heading type="h3">Primitive Color</Heading>
        <p className="text-fg-mute text-sm">
          情緒的な役割を持つ色、強調やアクセントに利用する
        </p>
        <div className="flex flex-col gap-6 p-2">
          <div className="flex flex-col gap-4">
            <Heading type="h4">Primary</Heading>
            <div className="grid grid-cols-auto-fill-70 gap-5">
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.primitive.primary.fg.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.primitive.primary.fg.dark}
                name="fg"
                variant="foreground"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.primitive.primary.bg.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.primitive.primary.bg.dark}
                name="bg"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.primitive.primary.bgSubtle.light}
                codeDark={
                  SEMANTIC_COLOR_VARIANTS.primitive.primary.bgSubtle.dark
                }
                name="bg subtle"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.primitive.primary.bgMute.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.primitive.primary.bgMute.dark}
                name="bg mute"
                variant="background"
              />
              <ColorInfo
                code={
                  SEMANTIC_COLOR_VARIANTS.primitive.primary.bgEmphasize.light
                }
                codeDark={
                  SEMANTIC_COLOR_VARIANTS.primitive.primary.bgEmphasize.dark
                }
                name="bg emphasize"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.primitive.primary.border.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.primitive.primary.border.dark}
                name="border"
                variant="border"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Heading type="h4">Secondary</Heading>
            <div className="grid grid-cols-auto-fill-70 gap-5">
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.primitive.secondary.fg.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.primitive.secondary.fg.dark}
                name="fg"
                variant="foreground"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.primitive.secondary.bg.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.primitive.secondary.bg.dark}
                name="bg"
                variant="background"
              />
              <ColorInfo
                code={
                  SEMANTIC_COLOR_VARIANTS.primitive.secondary.bgSubtle.light
                }
                codeDark={
                  SEMANTIC_COLOR_VARIANTS.primitive.secondary.bgSubtle.dark
                }
                name="bg subtle"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.primitive.secondary.bgMute.light}
                codeDark={
                  SEMANTIC_COLOR_VARIANTS.primitive.secondary.bgMute.dark
                }
                name="bg mute"
                variant="background"
              />
              <ColorInfo
                code={
                  SEMANTIC_COLOR_VARIANTS.primitive.secondary.bgEmphasize.light
                }
                codeDark={
                  SEMANTIC_COLOR_VARIANTS.primitive.secondary.bgEmphasize.dark
                }
                name="bg emphasize"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.primitive.secondary.border.light}
                codeDark={
                  SEMANTIC_COLOR_VARIANTS.primitive.secondary.border.dark
                }
                name="border"
                variant="border"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-3">
        <Heading type="h3">Semantic Color</Heading>
        <p className="text-fg-mute text-sm">
          機能的な役割を持つ色(情報、成功、警告、エラー)、利用者に色を用いて情報を届けたいときに利用する
        </p>
        <div className="flex flex-col gap-3 p-2">
          <div className="flex flex-col gap-3">
            <Heading type="h4">Foreground Color</Heading>
            <div className="grid grid-cols-auto-fill-70 gap-5">
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.fg.info.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.fg.info.dark}
                name="info"
                variant="foreground"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.fg.success.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.fg.success.dark}
                name="success"
                variant="foreground"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.fg.warning.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.fg.warning.dark}
                name="warning"
                variant="foreground"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.fg.error.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.fg.error.dark}
                name="error"
                variant="foreground"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3">
            <Heading type="h4">Background Color</Heading>
            <div className="grid grid-cols-auto-fill-70 gap-5">
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.bg.info.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.bg.info.dark}
                name="info"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.bg.success.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.bg.success.dark}
                name="success"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.bg.warning.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.bg.warning.dark}
                name="warning"
                variant="background"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.bg.error.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.bg.error.dark}
                name="error"
                variant="background"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3">
            <Heading type="h4">Border Color</Heading>
            <div className="grid grid-cols-auto-fill-70 gap-5">
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.border.info.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.border.info.dark}
                name="info"
                variant="border"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.border.success.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.border.success.dark}
                name="success"
                variant="border"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.border.warning.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.border.warning.dark}
                name="warning"
                variant="border"
              />
              <ColorInfo
                code={SEMANTIC_COLOR_VARIANTS.semantic.border.error.light}
                codeDark={SEMANTIC_COLOR_VARIANTS.semantic.border.error.dark}
                name="error"
                variant="border"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-1">
        <Heading type="h3">Base Color</Heading>
        <p className="text-fg-mute text-sm">
          デザインシステム全体で利用する基本色
        </p>
        <div className="flex flex-col gap-3">
          {Object.entries(COLOR_VARIANTS).map((value) => {
            return (
              <div
                className="flex flex-col justify-between gap-3 rounded-lg p-3"
                key={value[0]}
              >
                <Heading type="h4">{value[0]}</Heading>
                {typeof value[1] === 'string' ? (
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="flex h-12 w-24 items-center justify-center rounded-full border border-border-base"
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
                          className="flex flex-col items-center gap-2"
                          key={color[0]}
                        >
                          <div
                            className={cn(
                              'flex h-12 w-24 items-center justify-center rounded-full border border-border-base',
                              calcContrast(color[1], COLOR_VARIANTS.white) < 4.5
                                ? 'text-fg-base dark:text-fg-inverse'
                                : 'text-fg-inverse dark:text-fg-base',
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
