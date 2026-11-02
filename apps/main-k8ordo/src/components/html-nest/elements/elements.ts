import {
  HTML_ELEMENTS as BASE_HTML_ELEMENTS,
  applyElementDescriptions,
} from '@k8o/html-nest';
import type { ElementDescription, HtmlElementInfo } from '@k8o/html-nest';

// 要素データ（構造）と入れ子判定は @k8o/html-nest に委ね、
// UI 表示用の日本語文言だけをタグをキーにここで持つ。
// note 系はパッケージの英語文言（descriptions エントリ）に対応するものだけ、
// 末尾の句点なしで定義する（句点は表示側で補う。対応関係は elements.test.ts で検証）。
const ELEMENT_JA: Readonly<Record<string, ElementDescription>> = {
  a: {
    description: 'ハイパーリンクを表すアンカー要素',
    contentModelNote:
      '親のcontent modelに従う。子孫にinteractiveコンテンツやa要素、tabindex属性を持つ要素を含めてはならない',
  },
  abbr: { description: '略語・頭字語を表す要素' },
  address: {
    description: '連絡先情報を表す要素',
    contentModelNote:
      '見出しコンテンツ・セクショニングコンテンツ・header・footer・address を子孫に持てない',
  },
  area: {
    description: 'イメージマップ上の領域を表す要素',
    conditionalNote: '祖先に map 要素があるときのみ',
    contextsNote: 'map要素の子孫であること',
  },
  article: { description: '自己完結した独立コンテンツを表す要素' },
  aside: { description: '本筋から外れた補足コンテンツを表す要素' },
  audio: {
    description: '音声を埋め込み再生する要素',
    contentModelNote:
      '親のcontent modelに従う。source は src 属性がないときのみ、track はどちらでも置ける。メディア要素を子孫に持てない',
  },
  b: { description: '注目を引くテキストを表す要素' },
  base: { description: '文書の基準URL・既定ターゲットを指定する要素' },
  bdi: { description: '双方向テキストを分離する要素' },
  bdo: { description: 'テキストの書字方向を明示的に上書きする要素' },
  blockquote: { description: '他から引用したブロックを表す要素' },
  body: {
    description: '文書の本文コンテンツを表すルート直下の要素',
    contextsNote: 'html要素の2番目の子',
  },
  br: { description: '改行を表す要素' },
  button: {
    description: 'クリック可能なボタンを表す要素',
    contentModelNote: 'インタラクティブ要素を子孫に持たない phrasing content',
  },
  canvas: {
    description: 'スクリプトで描画する解像度依存ビットマップ領域',
    contentModelNote:
      '親のcontent modelに従う(透過)。フォールバック内容にinteractiveコンテンツは置けない（a・button・select・usemap付きimg・checkbox/radio/button型のinputは例外）',
  },
  caption: {
    description: 'テーブルのタイトルやキャプションを表す要素',
    contentModelNote: 'table を子孫に持たない flow content',
    contextsNote: 'table要素の最初の子',
  },
  cite: { description: '作品の題名を表す要素' },
  code: { description: 'コンピュータコードの断片を表す要素' },
  col: {
    description: 'テーブルの列を表す要素',
    contextsNote: 'span属性を持たないcolgroupの子',
  },
  colgroup: {
    description: 'テーブルの列グループを表す要素',
    contentModelNote: 'span属性を持たない場合、col要素とtemplate要素を子に持つ',
  },
  data: { description: '内容に機械可読な値を関連付ける要素' },
  datalist: {
    description: '入力候補となるoption群を提供する要素',
    contentModelNote:
      'phrasing content、またはoption要素とscript-supporting要素の組み合わせ',
  },
  dd: {
    description: '記述リストの説明・値部分を表す要素',
    contextsNote: 'div の中に置けるのは、その div が dl の子であるときのみ',
  },
  del: {
    description: 'ドキュメントから削除された内容を表す。',
    contentModelNote: '親のcontent modelに従う',
  },
  details: { description: '開閉して情報を表示する開示ウィジェット。' },
  dfn: {
    description: '用語の定義箇所を表す。',
    contentModelNote: 'dfn を子孫に持たない phrasing content',
  },
  dialog: { description: 'ダイアログボックスやサブウィンドウ。' },
  div: {
    description: '汎用のブロックレベルコンテナ。',
    contextsNote: 'select・optgroup・option の中にもラッパーとして置ける',
  },
  dl: { description: '名前と値の組による説明リスト。' },
  dt: {
    description: '説明リストの項目名や用語。',
    contentModelNote:
      'header・footer・セクショニングコンテンツ・見出しコンテンツを子孫に持たない flow content',
    contextsNote: 'div の中に置けるのは、その div が dl の子であるときのみ',
  },
  em: { description: 'テキストの強調を表す。' },
  embed: { description: '外部アプリやプラグインの埋め込み点。' },
  fieldset: { description: 'フォーム部品をまとめるグループ。' },
  figcaption: { description: 'figureのキャプションや説明。' },
  figure: { description: 'キャプション付きの自己完結的な図表。' },
  footer: {
    description: 'セクションのフッター。著者情報や関連リンクを示す。',
    contentModelNote: 'header/footer を子孫に含めることはできない',
  },
  form: {
    description: '送信可能なデータを表すフォーム。',
    contentModelNote: 'form 要素を子孫に含めることはできない',
  },
  h1: { description: '最上位の見出し。' },
  h2: { description: '第2レベルの見出し。' },
  h3: { description: '第3レベルの見出し。' },
  h4: { description: '第4レベルの見出し。' },
  h5: { description: '第5レベルの見出し。' },
  h6: { description: '最下位レベルの見出し。' },
  head: { description: '文書のメタデータを格納する要素。' },
  header: {
    description: 'セクションの導入部やナビゲーションを示す。',
    contentModelNote: 'header/footer を子孫に含めることはできない',
  },
  hgroup: { description: '見出しと副題をまとめるグループ。' },
  hr: {
    description: '段落レベルのテーマの区切り。',
    contextsNote: 'select の中にも区切りとして置ける',
  },
  html: {
    description: 'HTML文書のルート要素。head と body を含む',
    contextsNote: 'ルート要素',
  },
  i: { description: '別の声調・気分など慣用的なテキスト範囲(斜体)' },
  iframe: {
    description: '入れ子のブラウジングコンテキスト(インラインフレーム)',
    contentModelNote: '内容は Nothing。iframe は空要素ではなく終了タグが必要',
  },
  img: { description: '画像を埋め込む要素' },
  input: { description: 'フォームの各種入力コントロール' },
  ins: {
    description: '文書に追加された内容を表す要素',
    contentModelNote: '親のcontent modelに従う',
  },
  kbd: { description: 'ユーザー入力(キー入力等)を表す要素' },
  label: {
    description: 'フォームコントロールのキャプション(ラベル)',
    contentModelNote:
      'label を子孫に持たず、ラベル付け対象以外の labelable 要素も子孫に持たない phrasing content',
  },
  legend: { description: 'fieldset のキャプション(説明見出し)' },
  li: { description: 'リストの項目' },
  link: {
    description: '外部リソースへのリンク(メタデータ)',
    conditionalNote:
      'itemprop 属性があるか rel が body-ok キーワード（stylesheet / preload / preconnect 等）のみのとき（body 内にも置ける）',
  },
  main: {
    description: '文書の主要コンテンツを表す要素',
    conditionalNote:
      '階層的に正しい main 要素のときのみ（祖先が html・body・div・アクセシブルネームを持たない form・自律カスタム要素に限られる）',
  },
  map: {
    description: '画像のクリック可能領域(イメージマップ)を定義する要素',
    contentModelNote: '親のcontent modelに従う。子孫に area 要素を持てる',
  },
  mark: { description: '参照や強調のためにハイライトされたテキスト' },
  math: {
    description: 'MathMLによる数式表現のルート要素',
    contentModelNote: 'MathMLの独自コンテンツ',
  },
  menu: { description: '操作項目を並べたツールバー風のリスト' },
  meta: {
    description: '文書のメタデータを表す要素',
    conditionalNote: 'itemprop 属性があるとき（microdata。body 内にも置ける）',
    contextsNote:
      'noscript内、または phrasing コンテキストにも置ける場合がある',
  },
  meter: {
    description: '既知の範囲内のスカラー値を表すゲージ',
    contentModelNote: '子孫に meter を含まない phrasing コンテンツ',
  },
  nav: { description: 'ナビゲーションリンクのセクション' },
  noscript: {
    description: 'スクリプト無効時に表示する代替コンテンツ',
    contentModelNote:
      'スクリプト無効時、head 内では link・style・meta。head 外では noscript を子孫に持たない透過。スクリプト有効時はテキスト',
    contextsNote: 'head 内、または phrasing コンテキストに置ける場合がある',
  },
  object: {
    description: '画像やネストした文書等の外部リソースを埋め込む要素',
    contentModelNote: '親のcontent modelに従う',
  },
  ol: { description: '順序付きリスト' },
  optgroup: { description: 'select内の選択肢をグループ化する要素' },
  option: {
    description: 'select/datalist/optgroup内の選択肢を表す要素',
    contentModelNote:
      'テキスト。または label 属性がなく datalist の外なら、interactive・datalist・object を子孫に持たない div 要素と phrasing content',
  },
  output: { description: '計算結果を表示する要素。' },
  p: { description: '段落を表す要素。' },
  picture: { description: '複数の画像候補から選択する画像コンテナ。' },
  pre: { description: '整形済みテキストを表す要素。' },
  progress: {
    description: 'タスクの進捗状況を示す要素。',
    contentModelNote: '子孫に progress を含まない phrasing content',
  },
  q: { description: '短いインライン引用を表す要素。' },
  rp: { description: 'ルビ非対応時の括弧を示す要素。' },
  rt: { description: 'ルビのふりがなテキストを表す要素。' },
  ruby: {
    description: 'ルビ注釈を付ける要素。',
    contentModelNote:
      '仕様の完全なモデルでは ruby の入れ子も制限される（直下に入れ子にできる ruby は1つまでで、さらに深い入れ子は不可）',
  },
  s: { description: '正確でなくなった内容を示す取り消し線要素。' },
  samp: { description: 'プログラムの出力サンプルを示す要素。' },
  script: {
    description: 'スクリプトやデータを埋め込む要素。',
    contentModelNote:
      'JavaScript 等のスクリプトまたはデータのテキストのみを入れられる',
  },
  search: { description: '検索やフィルタリング操作のための領域を表す要素。' },
  section: { description: '見出しを伴う汎用的なセクションを表す要素。' },
  select: {
    description: '選択肢から値を選ぶフォームコントロール要素。',
    contentModelNote:
      'ドロップダウンボックスの select のとき、先頭に button を1つ置ける',
  },
  selectedcontent: {
    description: 'select内で選択中option内容を複製表示する要素。',
    conditionalNote: 'select の子である button の子孫のときのみ',
    contentModelNote:
      '内容は Nothing。ブラウザが選択中の option の内容を複製して表示する',
    contextsNote: 'select の最初の子である button の中',
  },
  slot: {
    description: 'Shadow DOMで差し込み内容を配置するプレースホルダー要素。',
    contentModelNote: '親のcontent modelに従う。フォールバック内容を持てる',
  },
  small: { description: '免責事項や注釈などの注記を表す要素。' },
  source: {
    description: 'picture/video/audioに複数メディア候補を指定する要素。',
  },
  span: { description: '意味を持たない汎用的なインラインコンテナ要素。' },
  strong: { description: '強い重要性や緊急性を表す要素。' },
  style: {
    description: '文書に埋め込むCSSスタイル情報を表す要素。',
    contentModelNote: 'CSS 等のスタイル情報のテキストのみを入れられる',
  },
  sub: { description: '下付き文字を表す要素。' },
  summary: { description: 'details要素の開閉用見出しを表す要素。' },
  sup: { description: '上付き文字を表すフレージング要素。' },
  svg: {
    description: 'SVGベクターグラフィックの埋め込み要素。',
    contentModelNote: 'SVGの独自コンテンツ',
  },
  table: {
    description: '表形式データを表すテーブル要素。',
    contentModelNote:
      'tbody の子を持たない table に限り、tr を直接の子に置ける',
  },
  tbody: { description: 'テーブルの本体行をまとめる要素。' },
  td: { description: 'テーブルのデータセル。' },
  template: {
    description: 'クライアントで複製するコンテンツの雛形。',
    contentModelNote:
      '内容モデルは Nothing。記述した内容は content の DocumentFragment に格納される',
  },
  textarea: { description: '複数行のテキスト入力フォーム部品。' },
  tfoot: { description: 'テーブルのフッター行をまとめる要素。' },
  th: {
    description: 'テーブルの見出しセル。',
    contentModelNote:
      '見出しコンテンツ・セクショニングコンテンツ・header・footer を子孫に持たない flow content',
  },
  thead: { description: 'テーブルのヘッダー行をまとめる要素。' },
  time: { description: '日時や期間を機械可読に表す要素。' },
  title: { description: '文書のタイトルを表すメタデータ要素。' },
  tr: {
    description: 'テーブルの行。セル(th/td)をまとめる。',
    contentModelNote: 'セル（td / th）とスクリプトサポート要素を子に持つ',
    contextsNote:
      'tbody の子がない table に限り直下に置ける（caption・colgroup・thead より後）',
  },
  track: { description: 'メディア要素の字幕やキャプションを指定。' },
  u: { description: '非言語的に注釈付けされたテキスト範囲。' },
  ul: { description: '順序なしリスト。' },
  var: { description: '変数や数式中の変数を表す。' },
  video: {
    description: '動画コンテンツを埋め込む。',
    contentModelNote:
      '親のcontent modelに従う。source は src 属性がないときのみ、track はどちらでも置ける。メディア要素を子孫に持てない',
  },
  wbr: { description: '改行可能位置を示す。' },
};

export const HTML_ELEMENTS: readonly HtmlElementInfo[] =
  applyElementDescriptions(BASE_HTML_ELEMENTS, ELEMENT_JA);

// タグ名の一覧は日本語化で変わらないため、パッケージのものをそのまま公開する。
export { HTML_ELEMENT_TAGS } from '@k8o/html-nest';
