'use client';

import { Button, FormControl, Select, TextField } from '@k8ordo/ui';
import { useState } from 'react';

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
    <div className="flex flex-col gap-6">
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

      <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="flex flex-col gap-2">
        <p className="text-fg-base text-sm font-bold">呼び出し履歴</p>
        {sentList.length === 0 ? (
          <p className="text-fg-mute text-sm">まだ呼び出していません</p>
        ) : (
          <ol className="flex flex-col gap-1">
            {sentList.map((sent) => (
              <li
                className="text-fg-base font-mono text-sm break-all"
                key={sent.id}
              >
                {`button.ariaNotify('${sent.announcement}', { priority: '${sent.priority}' })`}
                <span className="text-fg-mute">
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
