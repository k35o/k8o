'use client';

import { Button, FormControl, TextField } from '@k8ordo/ui';
import { useState } from 'react';
import type { FC } from 'react';

const presetTags = [
  'ja-JP',
  'en-US',
  'en-GB',
  'ar-EG',
  'zh-Hant-TW',
  'ja-JP-u-ca-japanese',
];

type MethodResult = {
  method: string;
  value: string;
};

const formatValue = (value: unknown): string =>
  value === undefined ? 'undefined' : JSON.stringify(value);

const resolveResults = (tag: string): MethodResult[] | null => {
  try {
    const locale = new Intl.Locale(tag);
    return [
      { method: 'getWeekInfo()', value: formatValue(locale.getWeekInfo()) },
      { method: 'getTextInfo()', value: formatValue(locale.getTextInfo()) },
      { method: 'getCalendars()', value: formatValue(locale.getCalendars()) },
      { method: 'getHourCycles()', value: formatValue(locale.getHourCycles()) },
      {
        method: 'getNumberingSystems()',
        value: formatValue(locale.getNumberingSystems()),
      },
      { method: 'getCollations()', value: formatValue(locale.getCollations()) },
      { method: 'getTimeZones()', value: formatValue(locale.getTimeZones()) },
    ];
  } catch {
    return null;
  }
};

export const IntlLocaleInfoDemo: FC = () => {
  const [tag, setTag] = useState('ja-JP');
  const results = resolveResults(tag.trim());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <FormControl
          errorText={
            results === null ? 'ロケール識別子として解釈できません' : undefined
          }
          invalid={results === null}
          label="ロケール識別子"
          renderInput={({ 'aria-labelledby': _, ...props }) => (
            <TextField
              onChange={(e) => {
                setTag(e.currentTarget.value);
              }}
              value={tag}
              {...props}
            />
          )}
        />
        <div className="flex flex-wrap gap-2">
          {presetTags.map((preset) => (
            <Button
              color="base"
              isActive={preset === tag}
              key={preset}
              onClick={() => {
                setTag(preset);
              }}
              size="sm"
              variant="outline"
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>
      {results !== null && (
        <dl className="flex flex-col gap-3">
          {results.map(({ method, value }) => (
            <div
              className="flex flex-col gap-0.5 sm:flex-row sm:gap-3"
              key={method}
            >
              <dt className="text-fg-base shrink-0 font-mono text-sm sm:w-56">
                {method}
              </dt>
              <dd className="text-fg-mute font-mono text-sm break-all">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
