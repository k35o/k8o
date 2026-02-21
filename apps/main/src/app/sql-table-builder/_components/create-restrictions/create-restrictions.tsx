import { Button } from '@k8o/arte-odyssey/button';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import {
  ChevronIcon,
  CloseIcon,
  LinkIcon,
  PlusIcon,
} from '@k8o/arte-odyssey/icons';
import { uuidV4 } from '@repo/helpers/uuid-v4';
import { type FC, useState } from 'react';
import type { Column } from '../../_types/column';
import type {
  InvalidRestrictions,
  Restriction,
  RestrictionType,
} from '../../_types/restriction';
import { CreateRestriction } from '../create-restriction/create-restriction';

type Props = {
  columns: Record<string, Column>;
  restrictions: Record<string, Restriction>;
  setRestrictions: (restrictions: Record<string, Restriction>) => void;
  restrictionsError: InvalidRestrictions['errors'] | undefined;
};

const RESTRICTION_CONFIG: Record<
  RestrictionType,
  { label: string; badge: string }
> = {
  primary: {
    label: 'PRIMARY KEY',
    badge: 'bg-bg-warning text-fg-warning',
  },
  unique: {
    label: 'UNIQUE',
    badge: 'bg-bg-info text-fg-info',
  },
  foreign: {
    label: 'FOREIGN KEY',
    badge: 'bg-bg-success text-fg-success',
  },
};

const RestrictionItem: FC<{
  id: string;
  restriction: Restriction;
  index: number;
  restrictionError: InvalidRestrictions['errors'][string] | undefined;
  columns: Record<string, Column>;
  setRestriction: (restriction: Restriction) => void;
  onDelete: () => void;
  canDelete: boolean;
}> = ({
  restriction,
  index,
  restrictionError,
  columns,
  setRestriction,
  onDelete,
  canDelete,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const config = RESTRICTION_CONFIG[restriction.type];

  return (
    <div className="overflow-hidden rounded-lg border border-border-base bg-bg-base">
      {/* ヘッダー */}
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
        <button
          aria-expanded={isOpen}
          className="flex flex-1 items-center gap-3 text-left transition-colors hover:opacity-80"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded bg-bg-mute font-mono text-fg-mute text-xs">
            {index + 1}
          </span>
          {restriction.type === 'foreign' && <LinkIcon />}
          <span
            className={`rounded px-2 py-0.5 font-medium text-xs ${config.badge}`}
          >
            {config.label}
          </span>
          <div>
            <ChevronIcon direction="down" />
          </div>
        </button>
        {canDelete && (
          <IconButton
            label="削除"
            onClick={() => {
              onDelete();
            }}
            size="sm"
          >
            <CloseIcon />
          </IconButton>
        )}
      </div>

      {/* コンテンツ */}
      {isOpen && (
        <div>
          <div className="overflow-hidden border-border-base border-t px-4 py-4">
            <CreateRestriction
              columns={columns}
              restriction={restriction}
              restrictionError={restrictionError}
              setRestriction={setRestriction}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const CreateRestrictions: FC<Props> = ({
  columns,
  restrictions,
  setRestrictions,
  restrictionsError,
}) => {
  const restrictionsEntries = Object.entries(restrictions);

  const handleAddRestriction = () => {
    setRestrictions({
      ...restrictions,
      [uuidV4()]: {
        type: 'primary',
        columns: [],
      },
    });
  };

  const handleDeleteRestriction = (idToDelete: string) => {
    setRestrictions(
      Object.fromEntries(
        restrictionsEntries.filter(([id]) => id !== idToDelete),
      ),
    );
  };

  const handleSetRestriction = (idToUpdate: string) => (value: Restriction) => {
    setRestrictions(
      Object.fromEntries(
        restrictionsEntries.map(([id, restriction]) => {
          if (id === idToUpdate) {
            return [id, value];
          }
          return [id, restriction];
        }),
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ツールバー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddRestriction}
            size="sm"
            startIcon={<PlusIcon />}
            variant="outlined"
          >
            制約を追加
          </Button>
          <span className="text-fg-mute text-sm">
            {restrictionsEntries.length}個の制約
          </span>
        </div>
      </div>

      {/* 制約リスト */}
      <div className="flex flex-col gap-3">
        {restrictionsEntries.map(([id, restriction], idx) => {
          const restrictionError = restrictionsError?.[id];
          return (
            <RestrictionItem
              canDelete
              columns={columns}
              id={id}
              index={idx}
              key={id}
              onDelete={() => handleDeleteRestriction(id)}
              restriction={restriction}
              restrictionError={restrictionError}
              setRestriction={handleSetRestriction(id)}
            />
          );
        })}
      </div>

      {/* 制約がない場合のプレースホルダー */}
      {restrictionsEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border-base border-dashed py-8">
          <p className="text-fg-mute text-sm">制約がありません</p>
          <Button
            onClick={handleAddRestriction}
            size="sm"
            startIcon={<PlusIcon />}
            variant="outlined"
          >
            制約を追加
          </Button>
        </div>
      )}
    </div>
  );
};
