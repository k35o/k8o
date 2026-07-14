import { Code, FormControl, TextField } from '@k8o/arte-odyssey';
import { useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';

import type { HtmlElementInfo } from '../../_types/html-element';
import {
  canSelfNest,
  describeAllowedContent,
  getElement,
} from '../../_utils/content-model';
import type { RelatedElement } from '../../_utils/content-model';
import { RelatedGroups } from '../related-groups';
import { RelationResults } from '../relation-results';
import { SpecialContentNotice } from '../special-content-notice';

type Direction = 'child' | 'parent';

type RelationSectionProps = {
  // 基準となる選択要素
  element: HtmlElementInfo;
  // child = 中に入れられる子要素 / parent = 包める親要素
  direction: Direction;
  items: readonly RelatedElement[];
  onSelect: (tag: string) => void;
};

const OK_LABEL: Record<Direction, string> = {
  child: 'そのまま子にできる（OK）',
  parent: 'そのまま親にできる（OK）',
};
const PLACEHOLDER: Record<Direction, string> = {
  child: '子要素を確かめる・絞り込み（例: li, span）',
  parent: '親要素を確かめる・絞り込み（例: ul, body）',
};
const LABEL: Record<Direction, string> = {
  child: '子要素で確かめる・絞り込み',
  parent: '親要素で確かめる・絞り込み',
};

export const RelationSection: FC<RelationSectionProps> = ({
  element,
  direction,
  items,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const tagSet = useMemo(
    () => new Set(items.map((related) => related.element.tag)),
    [items],
  );

  const trimmed = query.trim();
  const q = trimmed.toLowerCase();
  const filtered =
    q === ''
      ? items
      : items.filter((related) =>
          related.element.tag.toLowerCase().includes(q),
        );

  // 入力が「実在するが関係にない要素」なら、その要素を対象に不可と理由を出す。
  const candidate = getElement(trimmed);
  const invalidTarget =
    candidate !== undefined && trimmed !== element.tag && !tagSet.has(trimmed)
      ? candidate
      : undefined;
  const isInvalid = invalidTarget !== undefined;
  // 自分自身のタグを打ったときは「自己入れ子の可否」を答える（該当なしにしない）。
  const isSelfQuery = trimmed !== '' && trimmed === element.tag;
  const selfNest = canSelfNest(element);

  const isSpecialChild =
    direction === 'child' && element.contentModel.kind !== 'elements';
  const isRootParent =
    direction === 'parent' && element.contexts.special === 'root';

  let invalidNote: ReactNode = null;
  if (invalidTarget !== undefined) {
    invalidNote =
      direction === 'child' ? (
        <>
          <Code>{`<${trimmed}>`}</Code> は <Code>{`<${element.tag}>`}</Code>{' '}
          の中に置けません。置けるのは: {describeAllowedContent(element)}
        </>
      ) : (
        <>
          <Code>{`<${element.tag}>`}</Code> は <Code>{`<${trimmed}>`}</Code>{' '}
          の中に置けません。<Code>{`<${trimmed}>`}</Code> に置けるのは:{' '}
          {describeAllowedContent(invalidTarget)}
        </>
      );
  }

  if (isSpecialChild) {
    return (
      <section className="flex flex-col">
        <SpecialContentNotice element={element} />
        {items.length > 0 && (
          <div className="mt-3">
            <RelatedGroups items={items} onSelect={onSelect} />
          </div>
        )}
      </section>
    );
  }

  if (isRootParent) {
    return (
      <section className="flex flex-col">
        <p className="text-fg-mute text-sm">
          <Code>{`<${element.tag}>`}</Code> はルート要素（親を持ちません）
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col">
      <div className="mb-3">
        <FormControl
          label={LABEL[direction]}
          renderInput={(props) => (
            <TextField
              {...props}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder={PLACEHOLDER[direction]}
              value={query}
            />
          )}
        />
      </div>
      {invalidTarget !== undefined && (
        <p className="border-border-mute bg-bg-subtle text-fg-base mb-3 rounded-md border px-3 py-2 text-sm leading-relaxed">
          <span className="text-fg-error font-medium">×</span> {invalidNote}
        </p>
      )}
      {isSelfQuery && (
        <p className="border-border-mute bg-bg-subtle text-fg-base mb-3 rounded-md border px-3 py-2 text-sm leading-relaxed">
          <Code>{`<${element.tag}>`}</Code>{' '}
          {selfNest.allowed
            ? `は自分自身を入れ子にできます${selfNest.conditional ? '（条件付き）' : ''}。`
            : 'は自分自身を入れ子にできません。'}
        </p>
      )}
      <RelationResults
        items={filtered}
        okLabel={OK_LABEL[direction]}
        onSelect={onSelect}
      />
      {filtered.length === 0 && !isInvalid && !isSelfQuery && (
        <p className="text-fg-mute text-sm">該当なし</p>
      )}
    </section>
  );
};
