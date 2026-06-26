import { Anchor, Badge, Code, Separator, Tabs } from '@k8o/arte-odyssey';
import { type FC, useMemo } from 'react';

import {
  CONTENT_CATEGORY_LABEL,
  FORM_CATEGORY_LABEL,
  KIND_LABEL,
} from '../../_data/categories';
import type { HtmlElementInfo } from '../../_types/html-element';
import {
  canSelfNest,
  getChildren,
  getParents,
} from '../../_utils/content-model';
import { specUrl } from '../../_utils/references';
import { ElementPickerModal } from '../element-picker-modal';
import { RelationSection } from '../relation-section';

const TAB_IDS: ['child', 'parent'] = ['child', 'parent'];

type ContainmentViewProps = {
  element: HtmlElementInfo;
  onSelect: (tag: string) => void;
};

export const ContainmentView: FC<ContainmentViewProps> = ({
  element,
  onSelect,
}) => {
  const children = useMemo(() => getChildren(element), [element]);
  const parents = useMemo(() => getParents(element), [element]);
  const selfNest = canSelfNest(element).allowed;
  const hasConditional = [...children, ...parents].some(
    (related) => related.conditional,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 選択中の要素（アクセント付きの焦点カード）。 */}
      <div className="border-primary-border bg-primary-bg-subtle rounded-xl border p-4 sm:p-5">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="text-primary-fg text-xs font-medium">選択中の要素</p>
          <ElementPickerModal onSelect={onSelect} />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-2xl">
            <Code>{`<${element.tag}>`}</Code>
          </span>
          <Badge
            size="sm"
            text={KIND_LABEL[element.contentModel.kind]}
            tone="neutral"
            variant="solid"
          />
          {selfNest && (
            <Badge
              size="sm"
              text="自己入れ子OK"
              tone="info"
              variant="outline"
            />
          )}
          {element.formCategories?.map((category) => (
            <Badge
              key={category}
              size="sm"
              text={FORM_CATEGORY_LABEL[category]}
              tone="neutral"
              variant="outline"
            />
          ))}
        </div>
        <p className="text-fg-mute mt-1.5 text-sm leading-relaxed">
          {element.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {element.categories.map((category) => (
            <span className="text-fg-mute text-xs" key={category}>
              {CONTENT_CATEGORY_LABEL[category]}
            </span>
          ))}
          <Anchor href={specUrl(element.tag)} openInNewTab>
            HTML 仕様
          </Anchor>
        </div>
      </div>

      {/* 子要素 / 親要素をタブで切り替える。 */}
      <div className="border-border-base bg-bg-base flex flex-col gap-4 rounded-xl border p-4 sm:p-5">
        <Tabs.Root defaultSelectedId="child" ids={TAB_IDS}>
          <Tabs.List label="子要素か親要素かを切り替え">
            <Tabs.Tab id="child">
              子要素にできるもの
              <span className="text-fg-mute ml-1 text-xs">
                {children.length}
              </span>
            </Tabs.Tab>
            <Tabs.Tab id="parent">
              親要素にできるもの
              <span className="text-fg-mute ml-1 text-xs">
                {parents.length}
              </span>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="child">
            <div className="pt-4">
              <RelationSection
                direction="child"
                element={element}
                items={children}
                key={`child-${element.tag}`}
                onSelect={onSelect}
              />
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="parent">
            <div className="pt-4">
              <RelationSection
                direction="parent"
                element={element}
                items={parents}
                key={`parent-${element.tag}`}
                onSelect={onSelect}
              />
            </div>
          </Tabs.Panel>
        </Tabs.Root>

        {hasConditional && (
          <>
            <Separator color="mute" />
            <p className="text-fg-mute text-xs">
              <span className="text-fg-warning font-bold">*</span> ＝
              文脈により条件付き（破線枠の要素）
            </p>
          </>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {`${element.tag} を選択。子要素にできるもの ${children.length} 件、親要素にできるもの ${parents.length} 件。`}
      </p>
    </div>
  );
};
