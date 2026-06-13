'use client';

import { NumberField, Slider, Tabs } from '@k8o/arte-odyssey';
import { toSrgbGamut } from '@repo/helpers/color/gamut';
import {
  type Color,
  clamp,
  colorToHsl,
  colorToOklch,
  colorToRgb255,
  hslToColor,
  oklchToColor,
  rgb255ToColor,
} from '@repo/helpers/color/spaces';
import { type FC, useId } from 'react';

type Props = {
  color: Color;
  onColorChange: (color: Color) => void;
};

type Channel = {
  label: string;
  min: number;
  max: number;
  step: number;
  precision: number;
  value: number;
  onChange: (value: number) => void;
};

const ChannelControl: FC<{ channel: Channel }> = ({ channel }) => {
  const id = useId();
  const value = clamp(channel.value, channel.min, channel.max);
  // NumberField のクリア時などに渡る NaN は無視する。
  const handleChange = (next: number): void => {
    if (!Number.isNaN(next)) {
      channel.onChange(next);
    }
  };
  return (
    <div className="flex items-center gap-3">
      <label
        className="text-fg-base w-8 shrink-0 text-sm font-bold"
        htmlFor={id}
      >
        {channel.label}
      </label>
      <div className="min-w-0 grow">
        <Slider
          aria-label={channel.label}
          id={id}
          max={channel.max}
          min={channel.min}
          onChange={handleChange}
          step={channel.step}
          value={value}
        />
      </div>
      <div className="w-20 shrink-0">
        <NumberField
          aria-label={channel.label}
          max={channel.max}
          min={channel.min}
          onChange={handleChange}
          precision={channel.precision}
          step={channel.step}
          value={value}
        />
      </div>
    </div>
  );
};

const ChannelGroup: FC<{ channels: Channel[] }> = ({ channels }) => (
  <div className="flex flex-col gap-4 pt-4">
    {channels.map((channel) => (
      <ChannelControl channel={channel} key={channel.label} />
    ))}
  </div>
);

export const ChannelSliders: FC<Props> = ({ color, onColorChange }) => {
  const rgb = colorToRgb255(color);
  const hsl = colorToHsl(color);
  const oklch = colorToOklch(color);

  const alphaChannel: Channel = {
    label: 'A',
    min: 0,
    max: 1,
    step: 0.01,
    precision: 2,
    value: color.alpha,
    onChange: (alpha) => {
      onColorChange({ ...color, alpha });
    },
  };

  const rgbChannels: Channel[] = [
    {
      label: 'R',
      min: 0,
      max: 255,
      step: 1,
      precision: 0,
      value: rgb.r,
      onChange: (r) => {
        onColorChange(rgb255ToColor({ ...rgb, r }, color.alpha));
      },
    },
    {
      label: 'G',
      min: 0,
      max: 255,
      step: 1,
      precision: 0,
      value: rgb.g,
      onChange: (g) => {
        onColorChange(rgb255ToColor({ ...rgb, g }, color.alpha));
      },
    },
    {
      label: 'B',
      min: 0,
      max: 255,
      step: 1,
      precision: 0,
      value: rgb.b,
      onChange: (b) => {
        onColorChange(rgb255ToColor({ ...rgb, b }, color.alpha));
      },
    },
    alphaChannel,
  ];

  const hslChannels: Channel[] = [
    {
      label: 'H',
      min: 0,
      max: 360,
      step: 1,
      precision: 0,
      value: hsl.h,
      onChange: (h) => {
        onColorChange(hslToColor({ ...hsl, h }, color.alpha));
      },
    },
    {
      label: 'S',
      min: 0,
      max: 100,
      step: 1,
      precision: 0,
      value: hsl.s,
      onChange: (s) => {
        onColorChange(hslToColor({ ...hsl, s }, color.alpha));
      },
    },
    {
      label: 'L',
      min: 0,
      max: 100,
      step: 1,
      precision: 0,
      value: hsl.l,
      onChange: (l) => {
        onColorChange(hslToColor({ ...hsl, l }, color.alpha));
      },
    },
    alphaChannel,
  ];

  const oklchChannels: Channel[] = [
    {
      label: 'L',
      min: 0,
      max: 1,
      step: 0.001,
      precision: 3,
      value: oklch.l,
      onChange: (l) => {
        onColorChange(toSrgbGamut(oklchToColor({ ...oklch, l }, color.alpha)));
      },
    },
    {
      label: 'C',
      min: 0,
      max: 0.4,
      step: 0.001,
      precision: 3,
      value: oklch.c,
      onChange: (c) => {
        onColorChange(toSrgbGamut(oklchToColor({ ...oklch, c }, color.alpha)));
      },
    },
    {
      label: 'H',
      min: 0,
      max: 360,
      step: 1,
      precision: 1,
      value: oklch.h,
      onChange: (h) => {
        onColorChange(toSrgbGamut(oklchToColor({ ...oklch, h }, color.alpha)));
      },
    },
    alphaChannel,
  ];

  return (
    <Tabs.Root defaultSelectedId="rgb" ids={['rgb', 'hsl', 'oklch']}>
      <Tabs.List label="編集する色空間">
        <Tabs.Tab id="rgb">RGB</Tabs.Tab>
        <Tabs.Tab id="hsl">HSL</Tabs.Tab>
        <Tabs.Tab id="oklch">OKLCH</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="rgb">
        <ChannelGroup channels={rgbChannels} />
      </Tabs.Panel>
      <Tabs.Panel id="hsl">
        <ChannelGroup channels={hslChannels} />
      </Tabs.Panel>
      <Tabs.Panel id="oklch">
        <ChannelGroup channels={oklchChannels} />
      </Tabs.Panel>
    </Tabs.Root>
  );
};
