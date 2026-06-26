import type {
  ContentCategory,
  ContentModelKind,
  FormCategory,
} from '../_types/html-element';

// コンテンツカテゴリの表示メタ情報。
// ラベルは WHATWG HTML Standard の正式名称（英語）をそのまま用いる。
// description は補足用の日本語説明。
type CategoryMeta = {
  key: ContentCategory;
  label: string;
  description: string;
};

// 出現順は HTML 仕様のカテゴリ紹介順（§3.2.5.2 Kinds of content）に揃える。
export const CONTENT_CATEGORY_METAS: readonly CategoryMeta[] = [
  {
    key: 'metadata',
    label: 'Metadata content',
    description: '文書情報や他リソースとの関係を示す。多くは head 内に置く。',
  },
  {
    key: 'flow',
    label: 'Flow content',
    description: '本文に置けるほとんどの要素。body 直下に並ぶ大半が該当する。',
  },
  {
    key: 'sectioning',
    label: 'Sectioning content',
    description:
      '見出しとアウトラインの範囲を区切る。article・aside・nav・section。',
  },
  {
    key: 'heading',
    label: 'Heading content',
    description: 'セクションの見出し。h1〜h6 と hgroup。',
  },
  {
    key: 'phrasing',
    label: 'Phrasing content',
    description: '段落内のテキストとそのマークアップ（インライン相当）。',
  },
  {
    key: 'embedded',
    label: 'Embedded content',
    description: '画像・動画・音声など外部リソースを取り込む。',
  },
  {
    key: 'interactive',
    label: 'Interactive content',
    description: 'ユーザー操作を受け付ける。a・button・input・select など。',
  },
  {
    key: 'palpable',
    label: 'Palpable content',
    description: '中身が空でなく、ユーザーが知覚できる内容を持つ。',
  },
  {
    key: 'script-supporting',
    label: 'Script-supporting elements',
    description: '描画されず処理を支える。script と template。',
  },
  {
    key: 'select-inner',
    label: 'select element inner content',
    description: 'カスタマイズ可能な select の内側に置ける要素。',
  },
  {
    key: 'optgroup-inner',
    label: 'optgroup element inner content',
    description: 'optgroup の内側に置ける要素。',
  },
  {
    key: 'option-inner',
    label: 'option element inner content',
    description: 'option の内側に置ける要素。',
  },
];

export const CONTENT_CATEGORY_LABEL: Record<ContentCategory, string> =
  Object.fromEntries(
    CONTENT_CATEGORY_METAS.map((meta) => [meta.key, meta.label]),
  ) as Record<ContentCategory, string>;

// フォーム関連の付帯カテゴリ。仕様の用語をそのまま用いる。
export const FORM_CATEGORY_LABEL: Record<FormCategory, string> = {
  listed: 'listed',
  labelable: 'labelable',
  submittable: 'submittable',
  resettable: 'resettable',
  'form-associated': 'form-associated',
};

// content model 種別の表示ラベル。
export const KIND_LABEL: Record<ContentModelKind, string> = {
  elements: '通常',
  transparent: '透過 (transparent)',
  empty: '空要素 (void)',
  none: '内容なし (Nothing)',
  text: 'テキストのみ',
  foreign: 'SVG / MathML',
  varies: '文脈依存',
};
