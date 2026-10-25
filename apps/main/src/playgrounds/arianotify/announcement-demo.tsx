'use client';

import { Button, FormControl, Select, TextField } from '@k8ordo/ui';
import { useState } from 'react';

import styles from './announcement-demo.module.css';

const priorityOptions = [
  { value: 'normal', label: "'normal'（既定値）" },
  { value: 'high', label: "'high'" },
] as const;

const langOptions = [
  { value: 'ja', label: 'ja' },
  { value: 'en', label: 'en' },
] as const;

type Priority = (typeof priorityOptions)[number]['value'];
type Lang = (typeof langOptions)[number]['value'];

const isPriority = (value: string): value is Priority =>
  priorityOptions.some((option) => option.value === value);

const isLang = (value: string): value is Lang =>
  langOptions.some((option) => option.value === value);

type Sent = {
  id: string;
  announcement: string;
  priority: Priority;
  lang: Lang;
};

export function AnnouncementDemo() {
  const [announcement, setAnnouncement] = useState(
    '3件のファイルをアップロードしました',
  );
  const [priority, setPriority] = useState<Priority>('normal');
  const [lang, setLang] = useState<Lang>('ja');
  const [sentList, setSentList] = useState<readonly Sent[]>([]);

  return (
    <div className={styles.root}>
      <FormControl
        helpText="スクリーンリーダーを起動した状態でボタンを押すと、この文字列が読み上げられます"
        label="読み上げる文字列"
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <TextField
            {...props}
            onChange={(e) => {
              setAnnouncement(e.currentTarget.value);
            }}
            value={announcement}
          />
        )}
      />

      <div className={styles.options}>
        <FormControl
          label="priority"
          renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
            <Select
              {...props}
              onChange={(e) => {
                if (isPriority(e.currentTarget.value)) {
                  setPriority(e.currentTarget.value);
                }
              }}
              options={priorityOptions}
              value={priority}
            />
          )}
        />
        <FormControl
          label="ボタンの親要素のlang属性"
          renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
            <Select
              {...props}
              onChange={(e) => {
                if (isLang(e.currentTarget.value)) {
                  setLang(e.currentTarget.value);
                }
              }}
              options={langOptions}
              value={lang}
            />
          )}
        />
      </div>

      <div lang={lang}>
        <Button
          disabled={announcement === ''}
          onClick={(e) => {
            e.currentTarget.ariaNotify(announcement, { priority });
            setSentList((prev) =>
              [
                { id: crypto.randomUUID(), announcement, priority, lang },
                ...prev,
              ].slice(0, 5),
            );
          }}
        >
          ariaNotify()を呼ぶ
        </Button>
      </div>

      <div className={styles.history}>
        <p className={styles.heading}>呼び出し履歴</p>
        {sentList.length === 0 ? (
          <p className={styles.note}>まだ呼び出していません</p>
        ) : (
          <ol className={styles.entries}>
            {sentList.map((sent) => (
              <li className={styles.entry} key={sent.id}>
                {`button.ariaNotify('${sent.announcement}', { priority: '${sent.priority}' })`}
                <span className={styles.lang}>
                  {' '}
                  lang=&quot;{sent.lang}&quot;
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
