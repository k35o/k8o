'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { type ChangeEvent, useRef, useState } from 'react';

export const WebkitRelativePathDemo = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setFiles(files);
  };
  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setFiles(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <FormControl
            label="ディレクトリ選択"
            renderInput={({ id, describedbyId }) => (
              <input
                aria-describedby={describedbyId}
                className="max-w-80 cursor-pointer rounded-lg bg-primary-bg px-4 py-2 text-center font-bold text-fg text-md hover:bg-primary-bg/90 focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info active:bg-primary-bg/80"
                id={id}
                onChange={handleChange}
                ref={inputRef}
                type="file"
                // @ts-expect-error
                webkitdirectory="true"
              />
            )}
          />
        </div>
        <div>
          <Button color="gray" onClick={handleClear} size="md">
            選択を初期化
          </Button>
        </div>
      </div>
      <div className="rounded-b-sm p-4">
        <p className="font-bold">選択されたファイル一覧:</p>
        {files && files.length > 0 ? (
          <ul className="flex list-inside list-disc flex-col gap-1">
            {Array.from(files).map((file) => (
              <li key={file.webkitRelativePath}>{file.webkitRelativePath}</li>
            ))}
          </ul>
        ) : (
          <p>ファイルが選択されていません。</p>
        )}
      </div>
    </div>
  );
};
