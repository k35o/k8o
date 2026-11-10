'use client';

import { Button, FileField, FormControl } from '@k8ordo/ui';

import styles from './webkit-relative-path-demo.module.css';

export const WebkitRelativePathDemo = () => (
  <form>
    <FormControl
      label="ディレクトリ選択"
      renderInput={(props) => (
        <FileField.Root webkitDirectory {...props}>
          <div className={styles.actions}>
            <FileField.Trigger
              renderItem={({ disabled, onClick }) => (
                <Button disabled={disabled} onClick={onClick} variant="outline">
                  ファイルを選択
                </Button>
              )}
            />
            <Button
              onClick={(event) => {
                event.currentTarget.form?.reset();
              }}
              variant="outline"
            >
              すべて解除
            </Button>
          </div>
          <FileField.ItemList clearable showWebkitRelativePath />
        </FileField.Root>
      )}
    />
  </form>
);
