import { CONTENT_CATEGORY_LABEL, FORM_CATEGORY_LABEL } from '@k8o/html-nest';
import type { ContentModelKind, HtmlElementInfo } from '@k8o/html-nest';
import { Anchor, Badge, Code, Separator, Tabs } from '@k8ordo/ui';
import { useMemo } from 'react';
import type { FC } from 'react';

import {
  canSelfNest,
  getChildren,
  getParents,
} from '../../_utils/content-model';
import { specUrl } from '../../_utils/references';
import { ElementPickerModal } from '../element-picker-modal';
import { RelationSection } from '../relation-section';

import styles from './containment-view.module.css';

const TAB_IDS: ['child', 'parent'] = ['child', 'parent'];

// content model 種別のバッジ表示ラベル。
const KIND_LABEL: Record<ContentModelKind, string> = {
  elements: '通常',
  transparent: '透過 (transparent)',
  empty: '空要素 (void)',
  none: '内容なし (Nothing)',
  text: 'テキストのみ',
  foreign: 'SVG / MathML',
  varies: '文脈依存',
};

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
    <div className={styles.root}>
      <div className={styles.selected}>
        <div className={styles.selectedHeader}>
          <p className={styles.selectedLabel}>選択中の要素</p>
          <ElementPickerModal onSelect={onSelect} />
        </div>
        <div className={styles.badges}>
          <span className={styles.tag}>
            <Code>{`<${element.tag}>`}</Code>
          </span>
          <Badge
            size="sm"
            label={KIND_LABEL[element.contentModel.kind]}
            tone="neutral"
            variant="solid"
          />
          {selfNest && (
            <Badge
              size="sm"
              label="自己入れ子OK"
              tone="info"
              variant="outline"
            />
          )}
          {element.formCategories?.map((category) => (
            <Badge
              key={category}
              size="sm"
              label={FORM_CATEGORY_LABEL[category]}
              tone="neutral"
              variant="outline"
            />
          ))}
        </div>
        <p className={styles.description}>{element.description}</p>
        <div className={styles.categories}>
          {element.categories.map((category) => (
            <span className={styles.category} key={category}>
              {CONTENT_CATEGORY_LABEL[category]}
            </span>
          ))}
          <Anchor href={specUrl(element.tag)} openInNewTab>
            HTML 仕様
          </Anchor>
        </div>
      </div>

      <div className={styles.relations}>
        <Tabs.Root defaultSelectedId="child" ids={TAB_IDS}>
          <Tabs.List label="子要素か親要素かを切り替え">
            <Tabs.Tab id="child">
              子要素にできるもの
              <span className={styles.count}>{children.length}</span>
            </Tabs.Tab>
            <Tabs.Tab id="parent">
              親要素にできるもの
              <span className={styles.count}>{parents.length}</span>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="child">
            <div className={styles.panel}>
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
            <div className={styles.panel}>
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
            <p className={styles.legend}>
              <span className={styles.legendMark}>*</span> ＝
              文脈により条件付き（破線枠の要素）
            </p>
          </>
        )}
      </div>

      <p aria-live="polite" className={styles.srOnly}>
        {`${element.tag} を選択。子要素にできるもの ${children.length} 件、親要素にできるもの ${parents.length} 件。`}
      </p>
    </div>
  );
};
