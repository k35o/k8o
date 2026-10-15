'use client';

import { Button, FormControl, TextField } from '@k8ordo/ui';
import { useState } from 'react';
import type { FC } from 'react';

import styles from './intl-locale-info-demo.module.css';

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
    <div className={styles.root}>
      <div className={styles.form}>
        <FormControl
          errorText={
            results === null ? 'ロケール識別子として解釈できません' : undefined
          }
          invalid={results === null}
          label="ロケール識別子"
          renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
            <TextField
              onChange={(e) => {
                setTag(e.currentTarget.value);
              }}
              value={tag}
              {...props}
            />
          )}
        />
        <div className={styles.presets}>
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
        <dl className={styles.results}>
          {results.map(({ method, value }) => (
            <div className={styles.result} key={method}>
              <dt className={styles.method}>{method}</dt>
              <dd className={styles.value}>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
