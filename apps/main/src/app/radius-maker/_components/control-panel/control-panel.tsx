'use client';

import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { RangeField } from '@k8o/arte-odyssey/form/range-field';
import { useClipboard } from '@k8o/arte-odyssey/hooks/clipboard';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { CopyIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
import { cn } from '@repo/helpers/cn';
import type { FC, KeyboardEvent, MouseEvent, TouchEvent } from 'react';
import { useMemo } from 'react';
import { TemplateSelector } from '../template-selector/template-selector';
import { useControlPanel } from './use-control-panel';

// ベースサイズ（px）
const BASE_SIZE = 192;
const BASE_SIZE_SM = 384;

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
        'absolute size-4 border border-border-base',
        variable === 'primary' && 'bg-group-primary',
        variable === 'secondary' && 'bg-group-secondary',
        variable === 'quaternary' && 'bg-group-quaternary',
        variable === 'tertiary' && 'bg-group-tertiary',
        isActive && 'bordertransparent outline-hidden ring-4 ring-fg-mute',
        'hover:bordertransparent hover:outline-hidden hover:ring-4 hover:ring-fg-mute',
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
    const calcSize = (base: number) => {
      if (aspectRatio >= 1) {
        return { width: base, height: base / aspectRatio };
      }
      return { width: base * aspectRatio, height: base };
    };
    return {
      mobile: calcSize(BASE_SIZE),
      desktop: calcSize(BASE_SIZE_SM),
    };
  }, [aspectRatio]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div
        className="relative border-2 border-borderPrimar border-dashed"
        ref={containerRef}
        style={{
          width: containerSize.mobile.width,
          height: containerSize.mobile.height,
        }}
      >
        <style>{`
          @media (min-width: 640px) {
            [data-radius-container] {
              width: ${containerSize.desktop.width}px !important;
              height: ${containerSize.desktop.height}px !important;
            }
          }
        `}</style>
        <div
          className="absolute size-full bg-primary-fg"
          data-radius-container
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
            top: '-9px',
            left: `calc(${position.topLeftX.toString()}% - 9px)`,
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
            top: '-9px',
            right: `calc(${position.topRightX.toString()}% - 9px)`,
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
            top: `calc(${position.topLeftY.toString()}% - 9px)`,
            left: '-9px',
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
            top: `calc(${position.topRightY.toString()}% - 9px)`,
            right: '-9px',
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
            bottom: `calc(${position.bottomLeftY.toString()}% - 9px)`,
            left: '-9px',
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
            bottom: `calc(${position.bottomRightY.toString()}% - 9px)`,
            right: '-9px',
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
            bottom: '-9px',
            left: `calc(${position.bottomLeftX.toString()}% - 9px)`,
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
            bottom: '-9px',
            right: `calc(${position.bottomRightX.toString()}% - 9px)`,
          }}
          variable="tertiary"
        />
      </div>
      <div className="flex w-full max-w-96 flex-col gap-4">
        <FormControl
          label="縦横比"
          renderInput={(props) => (
            <RangeField
              {...props}
              max={2}
              min={0.5}
              onChange={setAspectRatio}
              step={0.1}
              value={aspectRatio}
            />
          )}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-fg-mute text-sm">border-radius</p>
            <IconButton
              bg="base"
              label="値をコピーする"
              onClick={() =>
                void writeClipboard(`border-radius: ${borderRadius}`).then(
                  () => {
                    onOpen('success', 'クリップボードにコピーしました');
                  },
                )
              }
            >
              <CopyIcon />
            </IconButton>
          </div>
          <code className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-md bg-bg-mute p-3 font-mono text-fg-base text-sm">
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
      <TemplateSelector currentPosition={position} onSelect={setPosition} />
    </div>
  );
};
