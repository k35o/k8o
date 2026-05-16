'use client';

import { FormControl, Select } from '@k8o/arte-odyssey';
import { useState } from 'react';

type SkipInk = 'auto' | 'none' | 'all';

const SAMPLE_TEXT =
  '日本語の文章にunderlineを引くと、漢字の下端やぐ・ゆなどに線が触れて読みづらくなりがちです。Latin script: jumping typography.';

export function TextDecorationSkipInkDemo() {
  const [value, setValue] = useState<SkipInk>('all');

  return (
    <div className="flex flex-col gap-6">
      <FormControl
        label="text-decoration-skip-ink"
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <Select
            {...props}
            onChange={(e) => {
              setValue(e.target.value as SkipInk);
            }}
            options={[
              { value: 'auto', label: 'auto (既定)' },
              { value: 'none', label: 'none' },
              { value: 'all', label: 'all (Baseline 2026)' },
            ]}
            value={value}
          />
        )}
      />

      <div className="bg-bg-base rounded-xl p-6 text-lg shadow-sm">
        <p
          style={{
            textDecoration: 'underline',
            textDecorationSkipInk: value,
          }}
        >
          {SAMPLE_TEXT}
        </p>
      </div>
    </div>
  );
}
