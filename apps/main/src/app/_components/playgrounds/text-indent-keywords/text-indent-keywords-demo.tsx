'use client';

import { Checkbox, Code, FormControl, Select } from '@k8o/arte-odyssey';
import { useState } from 'react';

const sampleText =
  'これはtext-indentプロパティのデモです。テキストのインデントがどのように適用されるかを確認できます。各キーワードの違いを比較してみてください。';

export function TextIndentKeywordsDemo() {
  const [indentValue, setIndentValue] = useState('2em');
  const [useEachLine, setUseEachLine] = useState(false);
  const [useHanging, setUseHanging] = useState(false);

  const textIndent = [
    indentValue,
    useEachLine ? 'each-line' : '',
    useHanging ? 'hanging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <FormControl
          label="インデント量"
          renderInput={({ labelId: _, ...props }) => (
            <Select
              {...props}
              onChange={(e) => setIndentValue(e.target.value)}
              options={[
                { value: '1em', label: '1em' },
                { value: '2em', label: '2em' },
                { value: '3em', label: '3em' },
              ]}
              value={indentValue}
            />
          )}
        />
        <Checkbox
          label="each-line"
          onChange={(e) => setUseEachLine(e.target.checked)}
          value={useEachLine}
        />
        <Checkbox
          label="hanging"
          onChange={(e) => setUseHanging(e.target.checked)}
          value={useHanging}
        />
      </div>

      <div className="rounded-lg border border-border-base bg-bg-base p-6">
        <p
          style={{
            textIndent,
          }}
        >
          {sampleText}
          <br />
          {sampleText}
          <br />
          {sampleText}
        </p>
      </div>

      <Code>{`text-indent: ${textIndent};`}</Code>
    </div>
  );
}
