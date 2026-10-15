'use client';

import { FormControl } from '@k8ordo/ui';

import styles from './file-input-examples.module.css';

export const BasicFileInputExamples = () => (
  <div className={styles.root}>
    <FormControl
      label="単一ファイル選択"
      renderInput={({
        id,
        'aria-describedby': ariaDescribedby,
        'aria-labelledby': ariaLabelledby,
      }) => (
        <input
          aria-describedby={ariaDescribedby}
          aria-labelledby={ariaLabelledby}
          className={styles.input}
          id={id}
          type="file"
        />
      )}
    />

    <FormControl
      label="複数ファイル選択"
      renderInput={({
        id,
        'aria-describedby': ariaDescribedby,
        'aria-labelledby': ariaLabelledby,
      }) => (
        <input
          aria-describedby={ariaDescribedby}
          aria-labelledby={ariaLabelledby}
          className={styles.input}
          id={id}
          multiple
          type="file"
        />
      )}
    />
  </div>
);

export const WebkitDirectoryInputExample = () => (
  <FormControl
    label="ディレクトリ選択"
    renderInput={({
      id,
      'aria-describedby': ariaDescribedby,
      'aria-labelledby': ariaLabelledby,
    }) => (
      <input
        aria-describedby={ariaDescribedby}
        aria-labelledby={ariaLabelledby}
        className={styles.input}
        id={id}
        type="file"
        webkitdirectory
      />
    )}
  />
);
