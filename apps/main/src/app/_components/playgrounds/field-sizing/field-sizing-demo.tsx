'use client';

import {
  Badge,
  ChevronIcon,
  FormControl,
  Select,
  Separator,
} from '@k8o/arte-odyssey';
import { useState } from 'react';

const fruitOptions = ['りんご', 'ぶどう', 'パイナップル', 'ドラゴンフルーツ'];

const fieldSizingOptions = [
  { value: 'content', label: 'content' },
  { value: 'fixed', label: 'fixed（既定値）' },
];

type FieldSizing = 'content' | 'fixed';

export function FieldSizingDemo() {
  const [value, setValue] = useState<FieldSizing>('content');
  const [text, setText] = useState('短いテキスト');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState(
    'ここに入力すると、内容に合わせて高さが伸び縮みします。',
  );
  const [fruit, setFruit] = useState(fruitOptions[1]);

  const fieldStyle = { fieldSizing: value } as const;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="w-44">
          <FormControl
            label="field-sizing を選ぶ"
            renderInput={({ 'aria-labelledby': _, ...props }) => (
              <Select
                {...props}
                onChange={(e) => {
                  setValue(e.target.value as FieldSizing);
                }}
                options={fieldSizingOptions}
                value={value}
              />
            )}
          />
        </div>
        <p className="text-fg-mute pb-2.5 text-sm">
          値を切り替えると、下のコントロールに反映されます。
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-fg-base font-medium">プレビュー</span>
          <Badge
            text={`field-sizing: ${value}`}
            tone="info"
            variant="outline"
          />
        </div>

        <p className="text-fg-mute text-sm">
          各コントロールには min-width
          を設定しているため、縮んでもその幅で止まります。テキストエリアには
          rows も指定していますが、content
          では無視され、高さは内容に追従し、max-height
          に達するとスクロールします。
        </p>

        <label className="flex flex-col items-start gap-1.5">
          <span className="text-fg-mute text-sm">テキスト入力</span>
          <input
            aria-label="テキスト入力"
            className="border-border-base bg-bg-base text-fg-base max-w-full min-w-32 rounded-lg border px-3.5 py-2"
            onChange={(e) => {
              setText(e.target.value);
            }}
            style={fieldStyle}
            type="text"
            value={text}
          />
        </label>

        <label className="flex flex-col items-start gap-1.5">
          <span className="text-fg-mute text-sm">
            プレースホルダー付き入力（空のときはプレースホルダー幅）
          </span>
          <input
            aria-label="プレースホルダー付き入力"
            className="border-border-base bg-bg-base text-fg-base max-w-full min-w-32 rounded-lg border px-3.5 py-2"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="例: example@k8o.me"
            style={fieldStyle}
            type="text"
            value={email}
          />
        </label>

        <label className="flex flex-col items-start gap-1.5">
          <span className="text-fg-mute text-sm">テキストエリア</span>
          <textarea
            aria-label="テキストエリア"
            className="border-border-base bg-bg-base text-fg-base max-h-40 max-w-full min-w-48 rounded-lg border px-3.5 py-2"
            onChange={(e) => {
              setComment(e.target.value);
            }}
            rows={2}
            style={fieldStyle}
            value={comment}
          />
        </label>

        <label className="flex flex-col items-start gap-1.5">
          <span className="text-fg-mute text-sm">セレクトボックス</span>
          <div className="border-border-base bg-bg-base flex w-fit items-center rounded-lg border">
            <select
              aria-label="セレクトボックス"
              className="text-fg-base appearance-none bg-transparent py-2 ps-3.5 pe-1.5"
              onChange={(e) => {
                setFruit(e.target.value);
              }}
              style={fieldStyle}
              value={fruit}
            >
              {fruitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span aria-hidden className="text-fg-mute pointer-events-none pe-3">
              <ChevronIcon direction="down" size="sm" />
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
