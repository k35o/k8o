'use client';

import {
  Button,
  CopyIcon,
  FormControl,
  Slider,
  useClipboard,
  useToast,
} from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import type { FC, KeyboardEvent, MouseEvent, TouchEvent } from 'react';
import { useMemo } from 'react';
import { TemplateSelector } from '../template-selector';
import { useControlPanel } from './use-control-panel';

// ベースサイズ（px）
const BASE_SIZE = 192;

// ビューポート幅640px〜1280pxでモバイル値→2倍に連続スケーリング
const fluidPx = (mobile: number): string => {
  const desktop = mobile * 2;
  return `clamp(${mobile}px, ${((mobile * 100) / 640).toFixed(2)}vw, ${desktop}px)`;
};

const OperateButton: FC<{
  label: string;
  position: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  variable: 'primary' | 'secondary' | 'quaternary' | 'tertiary';
  onMouseDown: (e: MouseEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  isActive: boolean;
}> = ({
  label,
  position,
  variable,
  onMouseDown,
  onTouchStart,
  onKeyDown,
  isActive,
}) => {
  return (
    <button
      className={cn(
        'absolute size-6 rounded-full border-2 border-border-base sm:size-5',
        variable === 'primary' && 'bg-group-primary',
        variable === 'secondary' && 'bg-group-secondary',
        variable === 'quaternary' && 'bg-group-quaternary',
        variable === 'tertiary' && 'bg-group-tertiary',
        isActive && 'border-transparent outline-hidden ring-4 ring-fg-mute',
        'hover:border-transparent hover:outline-hidden hover:ring-4 hover:ring-fg-mute',
        'focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-fg-mute',
      )}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={position}
      type="button"
    >
      <span className="sr-only">{label}</span>
    </button>
  );
};

export const ControlPanel: FC = () => {
  const {
    activePosition,
    containerRef,
    mouseDownHandler,
    touchStartHandler,
    keyDownHandler,
    borderRadius,
    position,
    setPosition,
    aspectRatio,
    setAspectRatio,
  } = useControlPanel();
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  // アスペクト比に応じたサイズを計算
  const containerSize = useMemo(() => {
    if (aspectRatio >= 1) {
      return { width: BASE_SIZE, height: BASE_SIZE / aspectRatio };
    }
    return { width: BASE_SIZE * aspectRatio, height: BASE_SIZE };
  }, [aspectRatio]);

  const handleCopy = async () => {
    try {
      await writeClipboard(`border-radius: ${borderRadius}`);
      onOpen('success', 'クリップボードにコピーしました');
    } catch {
      onOpen('error', 'コピーに失敗しました');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* メインエリア: デスクトップ2カラム */}
      <div className="flex flex-col gap-8 sm:grid sm:grid-cols-[1fr_16rem] sm:items-start sm:gap-6">
        {/* テンプレート（モバイルでは先に表示） */}
        <div className="order-1 sm:order-2">
          <TemplateSelector currentPosition={position} onSelect={setPosition} />
          <div className="mt-6">
            <FormControl
              label="縦横比"
              renderInput={(props) => (
                <Slider
                  {...props}
                  max={2}
                  min={0.5}
                  onChange={setAspectRatio}
                  step={0.1}
                  value={aspectRatio}
                />
              )}
            />
          </div>
        </div>

        {/* シェイプエディタ */}
        <div className="order-2 flex items-center justify-center sm:sticky sm:top-6 sm:order-1">
          <div
            className="flex items-center justify-center"
            style={{
              width: `calc(${fluidPx(BASE_SIZE)} + 24px)`,
              height: `calc(${fluidPx(BASE_SIZE)} + 24px)`,
            }}
          >
            <div
              className="relative border-2 border-primary-border border-dashed"
              ref={containerRef}
              style={{
                width: fluidPx(containerSize.width),
                height: fluidPx(containerSize.height),
              }}
            >
              <div
                className="absolute size-full bg-primary-fg"
                style={{
                  borderRadius,
                }}
              />
              <OperateButton
                isActive={activePosition === 'topLeftX'}
                label="左上の上側の丸みを調整する(左右キーで操作します)"
                onKeyDown={(e) => {
                  keyDownHandler(e, 'topLeftX');
                }}
                onMouseDown={(e) => {
                  mouseDownHandler(e, 'topLeftX');
                }}
                onTouchStart={(e) => {
                  touchStartHandler(e, 'topLeftX');
                }}
                position={{
                  top: '-12px',
                  left: `calc(${position.topLeftX.toString()}% - 12px)`,
                }}
                variable="primary"
              />
              <OperateButton
                isActive={activePosition === 'topRightX'}
                label="右上の上側の丸みを調整する(左右キーで操作します)"
                onKeyDown={(e) => {
                  keyDownHandler(e, 'topRightX');
                }}
                onMouseDown={(e) => {
                  mouseDownHandler(e, 'topRightX');
                }}
                onTouchStart={(e) => {
                  touchStartHandler(e, 'topRightX');
                }}
                position={{
                  top: '-12px',
                  right: `calc(${position.topRightX.toString()}% - 12px)`,
                }}
                variable="secondary"
              />
              <OperateButton
                isActive={activePosition === 'topLeftY'}
                label="左上の左側の丸みを調整する(上下キーで操作します)"
                onKeyDown={(e) => {
                  keyDownHandler(e, 'topLeftY');
                }}
                onMouseDown={(e) => {
                  mouseDownHandler(e, 'topLeftY');
                }}
                onTouchStart={(e) => {
                  touchStartHandler(e, 'topLeftY');
                }}
                position={{
                  top: `calc(${position.topLeftY.toString()}% - 12px)`,
                  left: '-12px',
                }}
                variable="primary"
              />
              <OperateButton
                isActive={activePosition === 'topRightY'}
                label="右上の右側の丸みを調整する(上下キーで操作します)"
                onKeyDown={(e) => {
                  keyDownHandler(e, 'topRightY');
                }}
                onMouseDown={(e) => {
                  mouseDownHandler(e, 'topRightY');
                }}
                onTouchStart={(e) => {
                  touchStartHandler(e, 'topRightY');
                }}
                position={{
                  top: `calc(${position.topRightY.toString()}% - 12px)`,
                  right: '-12px',
                }}
                variable="secondary"
              />
              <OperateButton
                isActive={activePosition === 'bottomLeftY'}
                label="左下の左側の丸みを調整する(上下キーで操作します)"
                onKeyDown={(e) => {
                  keyDownHandler(e, 'bottomLeftY');
                }}
                onMouseDown={(e) => {
                  mouseDownHandler(e, 'bottomLeftY');
                }}
                onTouchStart={(e) => {
                  touchStartHandler(e, 'bottomLeftY');
                }}
                position={{
                  bottom: `calc(${position.bottomLeftY.toString()}% - 12px)`,
                  left: '-12px',
                }}
                variable="quaternary"
              />
              <OperateButton
                isActive={activePosition === 'bottomRightY'}
                label="右下の右側の丸みを調整する(上下キーで操作します)"
                onKeyDown={(e) => {
                  keyDownHandler(e, 'bottomRightY');
                }}
                onMouseDown={(e) => {
                  mouseDownHandler(e, 'bottomRightY');
                }}
                onTouchStart={(e) => {
                  touchStartHandler(e, 'bottomRightY');
                }}
                position={{
                  bottom: `calc(${position.bottomRightY.toString()}% - 12px)`,
                  right: '-12px',
                }}
                variable="tertiary"
              />
              <OperateButton
                isActive={activePosition === 'bottomLeftX'}
                label="左下の下側の丸みを調整する(左右キーで操作します)"
                onKeyDown={(e) => {
                  keyDownHandler(e, 'bottomLeftX');
                }}
                onMouseDown={(e) => {
                  mouseDownHandler(e, 'bottomLeftX');
                }}
                onTouchStart={(e) => {
                  touchStartHandler(e, 'bottomLeftX');
                }}
                position={{
                  bottom: '-12px',
                  left: `calc(${position.bottomLeftX.toString()}% - 12px)`,
                }}
                variable="quaternary"
              />
              <OperateButton
                isActive={activePosition === 'bottomRightX'}
                label="右下の下側の丸みを調整する(左右キーで操作します)"
                onKeyDown={(e) => {
                  keyDownHandler(e, 'bottomRightX');
                }}
                onMouseDown={(e) => {
                  mouseDownHandler(e, 'bottomRightX');
                }}
                onTouchStart={(e) => {
                  touchStartHandler(e, 'bottomRightX');
                }}
                position={{
                  bottom: '-12px',
                  right: `calc(${position.bottomRightX.toString()}% - 12px)`,
                }}
                variable="tertiary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CSS出力（全幅） */}
      <div className="relative rounded-xl border border-border-base bg-bg-base p-4">
        <div className="absolute top-3 right-3">
          <Button
            onClick={handleCopy}
            size="sm"
            startIcon={<CopyIcon size="sm" />}
            variant="outlined"
          >
            コピー
          </Button>
        </div>
        <p className="mb-2 font-bold text-fg-mute text-xs">border-radius</p>
        <code className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-fg-base text-sm">
          <span className="text-fg-mute">水平</span>
          <span>
            {position.topLeftX}% {100 - position.topRightX}%{' '}
            {100 - position.bottomRightX}% {position.bottomLeftX}%
          </span>
          <span className="text-fg-mute">垂直</span>
          <span>
            {position.topLeftY}% {position.topRightY}%{' '}
            {100 - position.bottomRightY}% {100 - position.bottomLeftY}%
          </span>
        </code>
      </div>
    </div>
  );
};
