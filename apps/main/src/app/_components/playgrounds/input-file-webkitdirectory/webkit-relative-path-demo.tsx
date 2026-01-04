'use client';

import { Button, FileField } from '@k8o/arte-odyssey';

export const WebkitRelativePathDemo = () => {
  return (
    <FileField.Root webkitDirectory>
      <FileField.Trigger
        renderItem={({ disabled, onClick }) => (
          <Button disabled={disabled} onClick={onClick} variant="outlined">
            ファイルを選択
          </Button>
        )}
      />
      <FileField.ItemList clearable showWebkitRelativePath />
    </FileField.Root>
  );
};
