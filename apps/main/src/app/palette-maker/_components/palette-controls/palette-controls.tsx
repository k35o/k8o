'use client';

import { FormControl, NumberField, Slider, TextField } from '@k8o/arte-odyssey';
import type { Color } from '@repo/helpers/color/spaces';
import { type ChangeEventHandler, type FC, useId, useState } from 'react';

import { HUE, PEAK_CHROMA, isTokenName } from '../../_utils/search-params';
import { BaseColorInput } from './base-color-input';

type ChannelRowProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  precision: number;
  value: number;
  onChange: (value: number) => void;
};

const ChannelRow: FC<ChannelRowProps> = ({
  label,
  min,
  max,
  step,
  precision,
  value,
  onChange,
}) => {
  const id = useId();
  // NumberField のクリア時などに渡る NaN は無視する。
  const handleChange = (next: number): void => {
    if (!Number.isNaN(next)) {
      onChange(next);
    }
  };
  return (
    <div className="flex items-center gap-3">
      <label
        className="text-fg-base w-28 shrink-0 text-sm font-bold"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="min-w-0 grow">
        <Slider
          aria-label={label}
          id={id}
          max={max}
          min={min}
          onChange={handleChange}
          step={step}
          value={value}
        />
      </div>
      <div className="w-24 shrink-0">
        <NumberField
          aria-label={label}
          max={max}
          min={min}
          onChange={handleChange}
          precision={precision}
          step={step}
          value={value}
        />
      </div>
    </div>
  );
};

type Props = {
  hue: number;
  chroma: number;
  name: string;
  onHueChange: (value: number) => void;
  onChromaChange: (value: number) => void;
  onNameChange: (value: string) => void;
  onBaseColorChange: (color: Color) => void;
};

export const PaletteControls: FC<Props> = ({
  hue,
  chroma,
  name,
  onHueChange,
  onChromaChange,
  onNameChange,
  onBaseColorChange,
}) => {
  const [draft, setDraft] = useState(name);
  const [prevName, setPrevName] = useState(name);
  const [invalidName, setInvalidName] = useState(false);

  // 外部（URL戻る等）からの変更時だけ入力欄へ反映する（入力途中の文字列は上書きしない）。
  if (name !== prevName) {
    setPrevName(name);
    if (name !== draft) {
      setDraft(name);
      setInvalidName(false);
    }
  }

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;
    setDraft(value);

    if (!isTokenName(value)) {
      setInvalidName(true);
      return;
    }
    setInvalidName(false);
    onNameChange(value);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <ChannelRow
          label="色相 (H)"
          max={HUE.max}
          min={HUE.min}
          onChange={onHueChange}
          precision={1}
          step={1}
          value={hue}
        />
        <ChannelRow
          label="ピーク彩度 (C)"
          max={PEAK_CHROMA.max}
          min={PEAK_CHROMA.min}
          onChange={onChromaChange}
          precision={3}
          step={0.001}
          value={chroma}
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormControl
          errorText={
            invalidName
              ? '小文字英数字とハイフンで32文字以内で入力してください'
              : undefined
          }
          helpText="CSS変数名（--color-{名前}-500 など）に使われます"
          invalid={invalidName}
          label="トークン名"
          renderInput={(props) => (
            <TextField
              {...props}
              autoComplete="off"
              onChange={handleNameChange}
              placeholder="primary"
              spellCheck={false}
              value={draft}
            />
          )}
        />
        <BaseColorInput onColorChange={onBaseColorChange} />
      </div>
    </div>
  );
};
