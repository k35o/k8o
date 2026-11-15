import { Card } from '@k8ordo/ui';

import { LogoIcon } from '@/app/_components/brand-icons/logo';

import { SignInForm } from './_components/sign-in-form';

import styles from './page.module.css';

export default function Page() {
  return (
    <div className={styles.root}>
      <Card variant="shadow">
        <div className={styles.card}>
          <div className={styles.header}>
            <LogoIcon size="xl" />
            <div className={styles.titles}>
              <h1 className={styles.title}>k8o AI</h1>
              <p className={styles.description}>
                このツールの利用にはログインが必要です
              </p>
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
}
