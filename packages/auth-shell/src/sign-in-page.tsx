import { Card, LogoIcon } from '@k8ordo/ui';
import type { FC } from 'react';

import { SignInForm } from './sign-in-form';

import styles from './sign-in-page.module.css';

export const SignInPage: FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className={styles.root}>
    <Card variant="shadow">
      <div className={styles.card}>
        <div className={styles.header}>
          <LogoIcon size="xl" />
          <div className={styles.titles}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>
            <p className={styles.note}>
              許可されたユーザーのみログインできます
            </p>
          </div>
        </div>
        <SignInForm />
      </div>
    </Card>
  </div>
);
