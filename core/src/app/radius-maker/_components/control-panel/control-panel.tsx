'use client';

import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { CopyIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
import { cn } from '@k8o/helpers/cn';
import { useClipboard } from '@k8o/hooks/clipboard';
import type { FC, KeyboardEvent, MouseEvent, TouchEvent } from 'react';
import { useControlPanel } from './use-control-panel';

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
  } = useControlPanel();
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div
        className="relative size-64 border-2 border-borderPrimar border-dashed sm:size-96"
        ref={containerRef}
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
      <div className="flex flex-wrap items-center justify-center gap-4">
        <p className="font-bold text-2xl">{borderRadius}</p>
        <IconButton
          bg="base"
          label="値をコピーする"
          onClick={() =>
            void writeClipboard(`border-radius: ${borderRadius}`).then(() => {
              onOpen('success', 'クリップボードにコピーしました');
            })
          }
        >
          <CopyIcon />
        </IconButton>
      </div>
    </div>
  );
};
