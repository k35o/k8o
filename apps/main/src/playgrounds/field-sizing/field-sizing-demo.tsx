'use client';

import { Badge, ChevronIcon, FormControl, Select } from '@k8ordo/ui';
import { useState } from 'react';

import styles from './field-sizing-demo.module.css';

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
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.selectField}>
          <FormControl
            label="field-sizing を選ぶ"
            renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
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
        <p className={styles.headerNote}>
          値を切り替えると、下のコントロールに反映されます。
        </p>
      </div>

      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <span className={styles.previewTitle}>プレビュー</span>
          <Badge
            label={`field-sizing: ${value}`}
            tone="info"
            variant="outline"
          />
        </div>

        <p className={styles.note}>
          各コントロールには min-width
          を設定しているため、縮んでもその幅で止まります。テキストエリアには
          rows も指定していますが、content
          では無視され、高さは内容に追従し、max-height
          に達するとスクロールします。
        </p>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>テキスト入力</span>
          <input
            aria-label="テキスト入力"
            className={styles.textInput}
            onChange={(e) => {
              setText(e.target.value);
            }}
            style={fieldStyle}
            type="text"
            value={text}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            プレースホルダー付き入力（空のときはプレースホルダー幅）
          </span>
          <input
            aria-label="プレースホルダー付き入力"
            className={styles.textInput}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="例: example@k8o.me"
            style={fieldStyle}
            type="text"
            value={email}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>テキストエリア</span>
          <textarea
            aria-label="テキストエリア"
            className={styles.textarea}
            onChange={(e) => {
              setComment(e.target.value);
            }}
            rows={2}
            style={fieldStyle}
            value={comment}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>セレクトボックス</span>
          <div className={styles.selectBox}>
            <select
              aria-label="セレクトボックス"
              className={styles.select}
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
            <span aria-hidden className={styles.chevron}>
              <ChevronIcon direction="down" size="sm" />
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
