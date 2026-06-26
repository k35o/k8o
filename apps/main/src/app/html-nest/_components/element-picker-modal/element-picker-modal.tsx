'use client';

import {
  Button,
  Dialog,
  FormControl,
  ListIcon,
  Modal,
  TextField,
} from '@k8o/arte-odyssey';
import { type FC, useCallback, useState } from 'react';

import { HTML_ELEMENTS } from '../../_data/elements';
import type { RelatedElement } from '../../_utils/content-model';
import { RelatedGroups } from '../related-groups';

// 役割別チップで全要素を見せる。選択用なので conditional は使わず false 固定。
const ALL: RelatedElement[] = HTML_ELEMENTS.map((element) => ({
  element,
  conditional: false,
}));

type ElementPickerModalProps = {
  onSelect: (tag: string) => void;
};

// 「要素を変える」ボタンでモーダルを開き、検索＋役割別一覧から選び直す。
export const ElementPickerModal: FC<ElementPickerModalProps> = ({
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered =
    q === ''
      ? ALL
      : ALL.filter(
          (related) =>
            related.element.tag.includes(q) ||
            related.element.description.toLowerCase().includes(q),
        );

  const select = (tag: string): void => {
    onSelect(tag);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <>
      <Button
        color="gray"
        onClick={() => {
          setQuery('');
          setIsOpen(true);
        }}
        size="sm"
        startIcon={<ListIcon size="sm" />}
        variant="outline"
      >
        要素を変える
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <Dialog.Root>
          <Dialog.Header onClose={onClose} title="要素を選ぶ" />
          <Dialog.Content>
            {/* 閉じている間は重い一覧を組み立てない。 */}
            {isOpen && (
              <div className="flex flex-col gap-3">
                <FormControl
                  label="要素を検索"
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      onChange={(event) => {
                        setQuery(event.target.value);
                      }}
                      placeholder="タグ名や説明で検索（例: div, ul, table）"
                      value={query}
                    />
                  )}
                />
                <div className="max-h-[55vh] overflow-y-auto">
                  {filtered.length > 0 ? (
                    <RelatedGroups items={filtered} onSelect={select} />
                  ) : (
                    <p className="text-fg-mute text-sm">該当なし</p>
                  )}
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Root>
      </Modal>
    </>
  );
};
