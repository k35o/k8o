'use client';

import { useControlPanel } from './use-control-panel';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { CopyIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
import { cn } from '@k8o/helpers/cn';
import { useClipboard } from '@k8o/hooks/clipboard';
import { FC, KeyboardEvent, MouseEvent, TouchEvent } from 'react';

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
        'border-border-base absolute size-4 border',
        variable === 'primary' && 'bg-group-primary',
        variable === 'secondary' && 'bg-group-secondary',
        variable === 'quaternary' && 'bg-group-quaternary',
        variable === 'tertiary' && 'bg-group-tertiary',
        isActive &&
          'bordertransparent ring-fg-mute ring-4 outline-hidden',
        'hover:bordertransparent hover:ring-fg-mute hover:ring-4 hover:outline-hidden',
        'focus-visible:ring-fg-mute focus-visible:border-transparent focus-visible:ring-4 focus-visible:outline-hidden',
      )}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onKeyDown={onKeyDown}
      style={position}
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
        ref={containerRef}
        className="border-borderPrimar relative size-64 border-2 border-dashed sm:size-96"
      >
        <div
          className="bg-primary-fg absolute size-full"
          style={{
            borderRadius,
          }}
        />
        <OperateButton
          label="左上の上側の丸みを調整する(左右キーで操作します)"
          variable="primary"
          isActive={activePosition === 'topLeftX'}
          onMouseDown={(e) => {
            mouseDownHandler(e, 'topLeftX');
          }}
          onTouchStart={(e) => {
            touchStartHandler(e, 'topLeftX');
          }}
          onKeyDown={(e) => {
            keyDownHandler(e, 'topLeftX');
          }}
          position={{
            top: '-9px',
            left: `calc(${position.topLeftX.toString()}% - 9px)`,
          }}
        />
        <OperateButton
          label="右上の上側の丸みを調整する(左右キーで操作します)"
          variable="secondary"
          isActive={activePosition === 'topRightX'}
          onMouseDown={(e) => {
            mouseDownHandler(e, 'topRightX');
          }}
          onTouchStart={(e) => {
            touchStartHandler(e, 'topRightX');
          }}
          onKeyDown={(e) => {
            keyDownHandler(e, 'topRightX');
          }}
          position={{
            top: '-9px',
            right: `calc(${position.topRightX.toString()}% - 9px)`,
          }}
        />
        <OperateButton
          label="左上の左側の丸みを調整する(上下キーで操作します)"
          variable="primary"
          isActive={activePosition === 'topLeftY'}
          onMouseDown={(e) => {
            mouseDownHandler(e, 'topLeftY');
          }}
          onTouchStart={(e) => {
            touchStartHandler(e, 'topLeftY');
          }}
          onKeyDown={(e) => {
            keyDownHandler(e, 'topLeftY');
          }}
          position={{
            top: `calc(${position.topLeftY.toString()}% - 9px)`,
            left: '-9px',
          }}
        />
        <OperateButton
          label="右上の右側の丸みを調整する(上下キーで操作します)"
          variable="secondary"
          isActive={activePosition === 'topRightY'}
          onMouseDown={(e) => {
            mouseDownHandler(e, 'topRightY');
          }}
          onTouchStart={(e) => {
            touchStartHandler(e, 'topRightY');
          }}
          onKeyDown={(e) => {
            keyDownHandler(e, 'topRightY');
          }}
          position={{
            top: `calc(${position.topRightY.toString()}% - 9px)`,
            right: '-9px',
          }}
        />
        <OperateButton
          label="左下の左側の丸みを調整する(上下キーで操作します)"
          variable="quaternary"
          isActive={activePosition === 'bottomLeftY'}
          onMouseDown={(e) => {
            mouseDownHandler(e, 'bottomLeftY');
          }}
          onTouchStart={(e) => {
            touchStartHandler(e, 'bottomLeftY');
          }}
          onKeyDown={(e) => {
            keyDownHandler(e, 'bottomLeftY');
          }}
          position={{
            bottom: `calc(${position.bottomLeftY.toString()}% - 9px)`,
            left: '-9px',
          }}
        />
        <OperateButton
          label="右下の右側の丸みを調整する(上下キーで操作します)"
          variable="tertiary"
          isActive={activePosition === 'bottomRightY'}
          onMouseDown={(e) => {
            mouseDownHandler(e, 'bottomRightY');
          }}
          onTouchStart={(e) => {
            touchStartHandler(e, 'bottomRightY');
          }}
          onKeyDown={(e) => {
            keyDownHandler(e, 'bottomRightY');
          }}
          position={{
            bottom: `calc(${position.bottomRightY.toString()}% - 9px)`,
            right: '-9px',
          }}
        />
        <OperateButton
          label="左下の下側の丸みを調整する(左右キーで操作します)"
          variable="quaternary"
          isActive={activePosition === 'bottomLeftX'}
          onMouseDown={(e) => {
            mouseDownHandler(e, 'bottomLeftX');
          }}
          onTouchStart={(e) => {
            touchStartHandler(e, 'bottomLeftX');
          }}
          onKeyDown={(e) => {
            keyDownHandler(e, 'bottomLeftX');
          }}
          position={{
            bottom: '-9px',
            left: `calc(${position.bottomLeftX.toString()}% - 9px)`,
          }}
        />
        <OperateButton
          label="右下の下側の丸みを調整する(左右キーで操作します)"
          variable="tertiary"
          isActive={activePosition === 'bottomRightX'}
          onMouseDown={(e) => {
            mouseDownHandler(e, 'bottomRightX');
          }}
          onTouchStart={(e) => {
            touchStartHandler(e, 'bottomRightX');
          }}
          onKeyDown={(e) => {
            keyDownHandler(e, 'bottomRightX');
          }}
          position={{
            bottom: '-9px',
            right: `calc(${position.bottomRightX.toString()}% - 9px)`,
          }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <p className="text-2xl font-bold">{borderRadius}</p>
        <IconButton
          label="値をコピーする"
          bg="base"
          onClick={() =>
            void writeClipboard(
              `border-radius: ${borderRadius}`,
            ).then(() => {
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
