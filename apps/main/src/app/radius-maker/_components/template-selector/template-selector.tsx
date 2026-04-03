'use client';

import { Button, RadioCard } from '@k8o/arte-odyssey';
import { type ChangeEventHandler, type FC, useCallback, useId } from 'react';
import type { RadiusPosition } from '../../_types/radius-position';
import { positionToBorderRadius } from '../../_utils/position-to-border-radius';

// テンプレート定義
type RadiusTemplate = {
  name: string;
  position: RadiusPosition;
};

// 用意するテンプレート
const TEMPLATES: RadiusTemplate[] = [
  {
    name: '正方形',
    position: {
      topLeftX: 0,
      topLeftY: 0,
      topRightX: 0,
      topRightY: 0,
      bottomLeftX: 0,
      bottomLeftY: 0,
      bottomRightX: 0,
      bottomRightY: 0,
    },
  },
  {
    name: '角丸',
    position: {
      topLeftX: 10,
      topLeftY: 10,
      topRightX: 10,
      topRightY: 10,
      bottomLeftX: 10,
      bottomLeftY: 10,
      bottomRightX: 10,
      bottomRightY: 10,
    },
  },
  {
    name: '円',
    position: {
      topLeftX: 50,
      topLeftY: 50,
      topRightX: 50,
      topRightY: 50,
      bottomLeftX: 50,
      bottomLeftY: 50,
      bottomRightX: 50,
      bottomRightY: 50,
    },
  },
  {
    name: '横長',
    position: {
      topLeftX: 50,
      topLeftY: 30,
      topRightX: 50,
      topRightY: 30,
      bottomLeftX: 50,
      bottomLeftY: 30,
      bottomRightX: 50,
      bottomRightY: 30,
    },
  },
  {
    name: '縦長',
    position: {
      topLeftX: 30,
      topLeftY: 50,
      topRightX: 30,
      topRightY: 50,
      bottomLeftX: 30,
      bottomLeftY: 50,
      bottomRightX: 30,
      bottomRightY: 50,
    },
  },
  {
    name: '上丸',
    position: {
      topLeftX: 50,
      topLeftY: 50,
      topRightX: 50,
      topRightY: 50,
      bottomLeftX: 0,
      bottomLeftY: 0,
      bottomRightX: 0,
      bottomRightY: 0,
    },
  },
  {
    name: '左丸',
    position: {
      topLeftX: 50,
      topLeftY: 50,
      topRightX: 0,
      topRightY: 0,
      bottomLeftX: 50,
      bottomLeftY: 50,
      bottomRightX: 0,
      bottomRightY: 0,
    },
  },
  {
    name: 'しずく',
    position: {
      topLeftX: 50,
      topLeftY: 50,
      topRightX: 50,
      topRightY: 50,
      bottomLeftX: 0,
      bottomLeftY: 0,
      bottomRightX: 50,
      bottomRightY: 50,
    },
  },
];

const TEMPLATE_OPTIONS = TEMPLATES.map((template) => ({
  value: template.name,
  label: template.name,
  visual: (
    <div
      aria-hidden="true"
      className="size-10 bg-primary-bg"
      style={{
        borderRadius: positionToBorderRadius(template.position),
      }}
    />
  ),
}));

const generateRandomPosition = (): RadiusPosition => {
  return {
    topLeftX: Math.floor(Math.random() * 101),
    topLeftY: Math.floor(Math.random() * 101),
    topRightX: Math.floor(Math.random() * 101),
    topRightY: Math.floor(Math.random() * 101),
    bottomLeftX: Math.floor(Math.random() * 101),
    bottomLeftY: Math.floor(Math.random() * 101),
    bottomRightX: Math.floor(Math.random() * 101),
    bottomRightY: Math.floor(Math.random() * 101),
  };
};

type Props = {
  onSelect: (position: RadiusPosition) => void;
  currentPosition: RadiusPosition;
};

export const TemplateSelector: FC<Props> = ({ onSelect, currentPosition }) => {
  const labelId = useId();
  const selectedValue =
    TEMPLATES.find((template) =>
      Object.keys(template.position).every(
        (key) =>
          template.position[key as keyof RadiusPosition] ===
          currentPosition[key as keyof RadiusPosition],
      ),
    )?.name ?? '';

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const template = TEMPLATES.find((t) => t.name === e.target.value);
      if (template) {
        onSelect(template.position);
      }
    },
    [onSelect],
  );

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="font-bold text-fg-base text-sm" id={labelId}>
        テンプレートから始める
      </p>
      <RadioCard
        isDisabled={false}
        labelId={labelId}
        name="radius-template"
        onChange={handleChange}
        options={TEMPLATE_OPTIONS}
        value={selectedValue}
      />
      <Button
        onClick={() => onSelect(generateRandomPosition())}
        size="sm"
        variant="outlined"
      >
        ランダム
      </Button>
    </div>
  );
};
