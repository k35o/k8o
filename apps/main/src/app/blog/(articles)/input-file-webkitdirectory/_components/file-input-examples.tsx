'use client';

import { FormControl } from '@k8o/arte-odyssey/form/form-control';

const inputClassName =
  'max-w-80 cursor-pointer rounded-lg text-center font-bold bg-primary-bg text-fg hover:bg-primary-bg/90 active:bg-primary-bg/80 focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info px-4 py-2 text-md';

export const BasicFileInputExamples = () => {
  return (
    <div className="flex flex-col gap-4">
      <FormControl
        label="単一ファイル選択"
        renderInput={({ id, describedbyId }) => (
          <input
            aria-describedby={describedbyId}
            className={inputClassName}
            id={id}
            type="file"
          />
        )}
      />

      <FormControl
        label="複数ファイル選択"
        renderInput={({ id, describedbyId }) => (
          <input
            aria-describedby={describedbyId}
            className={inputClassName}
            id={id}
            multiple
            type="file"
          />
        )}
      />
    </div>
  );
};

export const WebkitDirectoryInputExample = () => {
  return (
    <FormControl
      label="ディレクトリ選択"
      renderInput={({ id, describedbyId }) => (
        <input
          aria-describedby={describedbyId}
          className={inputClassName}
          id={id}
          type="file"
          webkitdirectory="true"
        />
      )}
    />
  );
};
