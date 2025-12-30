'use client';

import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

// 8方向の角丸位置を定義
type RadiusPosition = {
  topLeftX: number;
  topLeftY: number;
  topRightX: number;
  topRightY: number;
  bottomLeftX: number;
  bottomLeftY: number;
  bottomRightX: number;
  bottomRightY: number;
};

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
      topLeftX: 20,
      topLeftY: 20,
      topRightX: 20,
      topRightY: 20,
      bottomLeftX: 20,
      bottomLeftY: 20,
      bottomRightX: 20,
      bottomRightY: 20,
    },
  },
  {
    name: '円形',
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
    name: '楕円（横）',
    position: {
      topLeftX: 50,
      topLeftY: 25,
      topRightX: 50,
      topRightY: 25,
      bottomLeftX: 50,
      bottomLeftY: 25,
      bottomRightX: 50,
      bottomRightY: 25,
    },
  },
  {
    name: '楕円（縦）',
    position: {
      topLeftX: 25,
      topLeftY: 50,
      topRightX: 25,
      topRightY: 50,
      bottomLeftX: 25,
      bottomLeftY: 50,
      bottomRightX: 25,
      bottomRightY: 50,
    },
  },
  {
    name: 'カプセル（上）',
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
    name: 'カプセル（左）',
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
    name: '有機的',
    position: {
      topLeftX: 63,
      topLeftY: 37,
      topRightX: 24,
      topRightY: 54,
      bottomLeftX: 53,
      bottomLeftY: 26,
      bottomRightX: 32,
      bottomRightY: 36,
    },
  },
  {
    name: 'しずく',
    position: {
      topLeftX: 0,
      topLeftY: 50,
      topRightX: 50,
      topRightY: 0,
      bottomLeftX: 50,
      bottomLeftY: 50,
      bottomRightX: 50,
      bottomRightY: 50,
    },
  },
];

// border-radius文字列を生成
const positionToBorderRadius = (position: RadiusPosition): string => {
  return `${position.topLeftX}% ${100 - position.topRightX}% ${100 - position.bottomRightX}% ${position.bottomLeftX}% / ${position.topLeftY}% ${position.topRightY}% ${100 - position.bottomRightY}% ${100 - position.bottomLeftY}%`;
};

type Props = {
  onSelect: (position: RadiusPosition) => void;
  currentPosition: RadiusPosition;
};

export const TemplateSelector: FC<Props> = ({ onSelect, currentPosition }) => {
  // 現在の位置がテンプレートと一致するかチェック
  const isMatchingTemplate = (template: RadiusTemplate): boolean => {
    return Object.keys(template.position).every(
      (key) =>
        template.position[key as keyof RadiusPosition] ===
        currentPosition[key as keyof RadiusPosition],
    );
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="font-bold text-fg-base text-sm">テンプレート</p>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0 sm:pb-0">
        {TEMPLATES.map((template) => {
          const isSelected = isMatchingTemplate(template);
          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                'group flex shrink-0 flex-col items-center gap-1.5 rounded-lg p-2 transition-all',
                'hover:bg-bg-mute',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-fg',
                isSelected && 'bg-bg-mute ring-2 ring-primary-fg',
              )}
              key={template.name}
              onClick={() => onSelect(template.position)}
              type="button"
            >
              <div
                aria-hidden="true"
                className={cn(
                  'size-10 border-2 transition-all sm:size-12',
                  isSelected
                    ? 'border-primary-fg bg-primary-fg'
                    : 'border-border-base bg-bg-mute group-hover:border-fg-mute',
                )}
                style={{
                  borderRadius: positionToBorderRadius(template.position),
                }}
              />
              <span
                className={cn(
                  'text-xs transition-colors',
                  isSelected ? 'font-bold text-fg-base' : 'text-fg-mute',
                )}
              >
                {template.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
