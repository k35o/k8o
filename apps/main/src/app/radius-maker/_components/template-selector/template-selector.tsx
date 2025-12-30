'use client';

import { Button } from '@k8o/arte-odyssey/button';
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
  {
    name: 'ブロブ',
    position: {
      topLeftX: 30,
      topLeftY: 70,
      topRightX: 70,
      topRightY: 30,
      bottomLeftX: 70,
      bottomLeftY: 30,
      bottomRightX: 30,
      bottomRightY: 70,
    },
  },
];

// border-radius文字列を生成（use-control-panelと同じ計算）
const positionToBorderRadius = (position: RadiusPosition): string => {
  return `${position.topLeftX}% ${position.topRightX}% ${position.bottomRightX}% ${position.bottomLeftX}% / ${position.topLeftY}% ${position.topRightY}% ${position.bottomRightY}% ${position.bottomLeftY}%`;
};

// ランダムな位置を生成
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
  // 現在の位置がテンプレートと一致するかチェック
  const isMatchingTemplate = (template: RadiusTemplate): boolean => {
    return Object.keys(template.position).every(
      (key) =>
        template.position[key as keyof RadiusPosition] ===
        currentPosition[key as keyof RadiusPosition],
    );
  };

  return (
    <div className="flex w-full max-w-96 flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-bold text-fg-base text-sm">テンプレート</p>
        <Button onClick={() => onSelect(generateRandomPosition())} size="sm">
          ランダム
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {TEMPLATES.map((template) => {
          const isSelected = isMatchingTemplate(template);
          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                'group flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all',
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
                  'size-12 border-2 transition-all',
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
