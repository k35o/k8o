'use client';

import { Button, FileField, FormControl } from '@k8o/arte-odyssey';

export const WebkitRelativePathDemo = () => {
  return (
    <FormControl
      label="ディレクトリ選択"
      renderInput={(props) => (
        <FileField.Root webkitDirectory {...props}>
          <FileField.Trigger
            renderItem={({ disabled, onClick }) => (
              <Button disabled={disabled} onClick={onClick} variant="outlined">
                ファイルを選択
              </Button>
            )}
          />
          <FileField.ItemList clearable showWebkitRelativePath />
        </FileField.Root>
      )}
    />
  );
};
