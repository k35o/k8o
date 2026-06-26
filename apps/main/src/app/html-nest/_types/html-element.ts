// HTML Living Standard の要素ごとの「コンテンツカテゴリ・content model・配置文脈」を
// 構造化して表現するための型。WHATWG HTML の elements index を出典とする。

// 入れ子の解決に使うコンテンツカテゴリ（包含関係は categories 集合に展開済み。
// 例: phrasing 要素は必ず flow にも属するため、両方を categories に持つ）。
export type ContentCategory =
  | 'metadata'
  | 'flow'
  | 'sectioning'
  | 'heading'
  | 'phrasing'
  | 'embedded'
  | 'interactive'
  | 'palpable'
  | 'script-supporting'
  // カスタマイズ可能な select 系の内部コンテンツカテゴリ
  | 'select-inner'
  | 'optgroup-inner'
  | 'option-inner';

// 入れ子判定には使わない、フォーム関連の付帯カテゴリ（バッジ表示のみ）。
export type FormCategory =
  | 'listed'
  | 'labelable'
  | 'submittable'
  | 'resettable'
  | 'form-associated';

// content model の種別。
// - elements: 具体要素やカテゴリで許可される子を持つ
// - transparent: 親の content model に従う（a, ins, del, object, map, canvas, video, audio, slot）
// - empty: 子を持てない void 要素
// - none: 子を持てないが void ではない（template。内容は content の DocumentFragment へ）
// - text: テキストのみ
// - foreign: SVG / MathML の独自コンテンツ
// - varies: 文脈により異なる（noscript）
export type ContentModelKind =
  | 'elements'
  | 'transparent'
  | 'empty'
  | 'none'
  | 'text'
  | 'foreign'
  | 'varies';

// 要素が「中に入れられる子要素」（content model）の表現。
type ContentModel = {
  kind: ContentModelKind;
  // 受け入れるコンテンツカテゴリ
  categories: readonly ContentCategory[];
  // 受け入れる具体要素（transparent の必須子 source/track/area なども含む）
  elements: readonly string[];
  // 条件付きで受け入れるカテゴリ・要素（spec 上のアスタリスク）
  conditionalCategories?: readonly ContentCategory[];
  conditionalElements?: readonly string[];
  // 特殊な content model の補足説明（日本語）
  note?: string;
};

// 要素が「置ける親要素」（配置文脈, spec の Parents 列）の表現。
// 主たる親子関係は content model から対称に導出するが、
// 要素特有の親（dd→dl/div, li→ol/ul など）はこの elements で補完する。
type ElementContexts = {
  categories: readonly ContentCategory[];
  elements: readonly string[];
  conditionalElements?: readonly string[];
  // html のようにルート要素で親を持たないもの
  special?: 'root';
  note?: string;
};

// 1 つの HTML 要素の全情報。
export type HtmlElementInfo = {
  tag: string;
  // 役割の簡潔な日本語説明
  description: string;
  // 属するコンテンツカテゴリ
  categories: readonly ContentCategory[];
  // 条件付きで属するカテゴリ（spec 上のアスタリスク）
  conditionalCategories?: readonly ContentCategory[];
  // この要素が「条件付き」で関係に入るときの条件説明（日本語・任意）。
  // 例: link なら「itemprop 属性があるとき」
  conditionalNote?: string;
  // フォーム関連の付帯カテゴリ
  formCategories?: readonly FormCategory[];
  // 中に入れられる子要素
  contentModel: ContentModel;
  // 置ける親要素（配置文脈）
  contexts: ElementContexts;
  // void 要素（contentModel.kind === 'empty'）かどうか
  void: boolean;
};
