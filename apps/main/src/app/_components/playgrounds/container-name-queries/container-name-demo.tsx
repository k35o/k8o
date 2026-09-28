'use client';

import { Code, Radio } from '@k8ordo/ui';
import { useId, useState } from 'react';

type ContainerName = 'none' | 'sidebar' | 'footer';

const nameOptions = [
  { value: 'none', label: 'none' },
  { value: 'sidebar', label: 'sidebar' },
  { value: 'footer', label: 'footer' },
] as const;

const isContainerName = (value: string): value is ContainerName =>
  nameOptions.some((option) => option.value === value);

export function ContainerNameDemo() {
  const [name, setName] = useState<ContainerName>('none');
  const labelId = useId();

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        .profile-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }

        @container sidebar {
          .profile-card {
            flex-direction: column;
            text-align: center;
          }
        }

        @container footer {
          .profile-card {
            padding: 0.5rem 1rem;
          }

          .profile-card-description {
            display: none;
          }
        }
      `}</style>

      <div className="flex flex-col gap-2">
        <p className="text-fg-base text-sm font-bold" id={labelId}>
          親の<Code>container-name</Code>の値
        </p>
        <Radio
          aria-labelledby={labelId}
          name={`container-name-${labelId}`}
          onChange={(value) => {
            if (isContainerName(value)) {
              setName(value);
            }
          }}
          options={nameOptions}
          value={name}
        />
      </div>

      {/* Firefoxはcontainer-nameの変更で子孫のスタイルを再計算しない(bug 2027807)ので、keyで要素ごと作り直す */}
      <div
        className="bg-bg-subtle flex flex-col gap-3 rounded-lg p-4"
        key={name}
        style={{ containerName: name }}
      >
        <p className="text-fg-mute text-sm">
          親 (<Code>{`container-name: ${name}`}</Code>)
        </p>
        <div className="profile-card bg-bg-base rounded-lg">
          <span className="bg-primary-fg block size-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1">
            <p className="text-fg-base font-bold">k8o</p>
            <p className="profile-card-description text-fg-mute text-sm">
              Webフロントエンドのエンジニアです。
            </p>
          </div>
        </div>
      </div>

      <p className="text-fg-mute text-sm">
        カードのスタイルは<Code>@container sidebar</Code>と
        <Code>@container footer</Code>
        に分けて書いてあり、親の名前と一致したほうが当たります。カードのクラスは変えていません。
      </p>
    </div>
  );
}
