'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Checkbox } from '@k8o/arte-odyssey/form/checkbox';
import { TagIcon } from '@k8o/arte-odyssey/icons';
import { Popover, useOpenContext } from '@k8o/arte-odyssey/popover';
import { type FC, useMemo } from 'react';

type Source = {
  id: number;
  title: string;
  articleCount: number;
};

type Props = {
  sources: readonly Source[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onClear: () => void;
};

const SourceList: FC<{
  sources: readonly Source[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onClear: () => void;
}> = ({ sources, selectedIds, onToggle, onClear }) => {
  const { onClose } = useOpenContext();
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <div className="flex w-72 flex-col gap-2 p-3">
      <div className="max-h-64 overflow-y-auto">
        <ul className="flex flex-col">
          {sources.map((source) => (
            <li
              className="flex items-center justify-between rounded-sm px-2 py-1.5 hover:bg-bg-mute"
              key={source.id}
            >
              <Checkbox
                label={source.title}
                onChange={() => {
                  onToggle(source.id);
                }}
                value={selectedSet.has(source.id)}
              />
              <span className="ml-2 shrink-0 text-fg-mute text-xs tabular-nums">
                {source.articleCount}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {selectedIds.length > 0 && (
        <div className="flex justify-end border-border-base border-t pt-2">
          <Button
            onClick={() => {
              onClear();
              onClose();
            }}
            size="sm"
            variant="skeleton"
          >
            すべてクリア
          </Button>
        </div>
      )}
    </div>
  );
};

export const SourcePicker: FC<Props> = ({
  sources,
  selectedIds,
  onToggle,
  onClear,
}) => {
  return (
    <Popover.Root placement="bottom-end" type="dialog">
      <Popover.Trigger
        renderItem={(props) => (
          <Button
            {...props}
            color="gray"
            size="md"
            startIcon={<TagIcon />}
            type="button"
            variant="outlined"
          >
            {selectedIds.length > 0
              ? `ソース (${selectedIds.length})`
              : 'ソース'}
          </Button>
        )}
      />
      <Popover.Content
        renderItem={(props) => (
          <div
            {...props}
            className="rounded-lg border border-border-mute bg-bg-base shadow-md"
          >
            <SourceList
              onClear={onClear}
              onToggle={onToggle}
              selectedIds={selectedIds}
              sources={sources}
            />
          </div>
        )}
      />
    </Popover.Root>
  );
};
