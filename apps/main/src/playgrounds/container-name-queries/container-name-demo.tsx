'use client';

import { Code, Radio } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useId, useState } from 'react';

import styles from './container-name-demo.module.css';

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
    <div className={styles.root}>
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

      <div className={styles.control}>
        <p className={styles.controlLabel} id={labelId}>
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
      <div className={styles.parent} key={name} style={{ containerName: name }}>
        <p className={styles.note}>
          親 (<Code>{`container-name: ${name}`}</Code>)
        </p>
        <div className={cn('profile-card', styles.card)}>
          <span className={styles.avatar} />
          <div className={styles.profile}>
            <p className={styles.name}>k8o</p>
            <p className={cn('profile-card-description', styles.description)}>
              Webフロントエンドのエンジニアです。
            </p>
          </div>
        </div>
      </div>

      <p className={styles.note}>
        カードのスタイルは<Code>@container sidebar</Code>と
        <Code>@container footer</Code>
        に分けて書いてあり、親の名前と一致したほうが当たります。カードのクラスは変えていません。
      </p>
    </div>
  );
}
