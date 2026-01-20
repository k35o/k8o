'use client';

import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { NumberField } from '@k8o/arte-odyssey/form/number-field';
import { motion } from 'motion/react';
import { useState } from 'react';

export function RootComparisonDemo() {
  const [fontSize, setFontSize] = useState(16);

  return (
    <div className="space-y-6">
      <FormControl
        helpText="8px〜48pxの範囲で変更できます"
        label="font-size"
        renderInput={({ labelId: _, ...props }) => (
          <div className="flex items-center gap-3">
            <NumberField
              max={48}
              min={8}
              onChange={setFontSize}
              step={1}
              value={fontSize}
              {...props}
            />
            <span className="shrink-0 text-fg-mute text-sm">px</span>
          </div>
        )}
      />

      <div className="flex flex-col gap-6 rounded-lg border border-border-base p-6">
        <div style={{ fontSize: `${fontSize}px` }}>
          <div className="flex items-center gap-4">
            <span className="w-16 font-mono text-fg-mute text-xs">1ch</span>
            <div className="flex items-center gap-2">
              <span style={{ lineHeight: 1 }}>0</span>
              <motion.div
                animate={{ width: `${fontSize}px` }}
                className="h-2 rounded bg-primary-fg"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            <span className="font-mono text-fg-mute text-xs">{fontSize}px</span>
          </div>
        </div>

        <div className="h-px bg-border-base" />

        <div>
          <div className="flex items-center gap-4">
            <span className="w-16 font-mono text-fg-mute text-xs">1rch</span>
            <div className="flex items-center gap-2">
              <span style={{ lineHeight: 1 }}>0</span>
              <div
                className="h-2 rounded bg-secondary-fg"
                style={{ width: '1rch' }}
              />
            </div>
            <span className="font-mono text-fg-mute text-xs">16px</span>
          </div>
        </div>
      </div>

      <p className="text-fg-mute text-sm">
        font-sizeの値を変更してみてください。chは親要素のfont-sizeに連動してサイズが変わりますが、rchは常にルート要素（16px）を基準にするため同じサイズです。
        <br />
        ブラウザの文字サイズ設定を変更している場合、正しく動作しないことがあります。
      </p>
    </div>
  );
}
