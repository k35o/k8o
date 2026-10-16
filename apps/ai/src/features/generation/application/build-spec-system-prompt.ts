import { catalog, uiRules } from '@k8ordo/ui/json-render';

type BuildSpecSystemPromptInput = {
  repairPrompt?: string | null | undefined;
};

const hasText = (value?: string | null): value is string =>
  typeof value === 'string' && value.trim() !== '';

const K8O_SYSTEM =
  'あなたは k8o のデザインシステム「@k8ordo/ui」に精通した UI デザイナーです。ユーザーの要望から、@k8ordo/ui コンポーネントで構成された UI を生成します。';

// inline モード（会話文→パッチ）の会話文パートに求める形式。タイトル行は
// プロジェクト名・履歴表示の情報源になる（クライアントの parseSpecProse が抽出する）。
const RESPONSE_RULES = [
  '応答は必ず「タイトル: <このUIの短い名前>」の1行で始め、続けて今回の生成・変更内容を1〜2文の日本語で説明してから、パッチを出力する。',
  'UI の変更が不要な質問・相談には、パッチを出力せず日本語の文章だけで答える。',
  // catalog の説明文は英語なので、UI の文言が英語に寄らないよう言語を固定する
  'UI に置く文言（見出し・ラベル・プレースホルダー・ボタンなど）はすべて日本語で書く。',
  '余白はたっぷり取る。レイアウトは Stack / Grid の gap・padding で組み、詰め込みすぎない。',
];

// 生成 UI はアプリと同じ文書の、画面より狭い枠に描くので、ビューポートのメディアクエリでは並べ方が変わらない。
// 枠の幅に合わせて列の数が変わるのは Grid の auto-fit だけなので、それで並べさせる
const LAYOUT_RULES = [
  'UI は端末の画面ではなく、それより狭い枠に描かれる。枠の幅は 280〜960px ほどで、スマホや狭い画面では 300px ほど、デスクトップでは 500〜960px ほどと、同じ UI でも見る場所で変わる。どの幅でも横にはみ出さず、文が数文字ずつで折り返さないように組む。',
  'Card のように中身のある要素を横に並べるときは、Grid の cols を "auto-fit" にし、minItemSize で1つの最小の幅を決める（1 が 4px で、48 なら 192px）。目安は、数字と短いラベルだけの統計は 40、見出し・短い行・ボタンを持つカード（料金プランや商品など）は 48、説明の文や入力欄を持つカードは 64、表やフォームを持つカードは 80。枠が狭くなると列が減り、1列まで折り返す。',
  '依頼に「3列」のような列の数があっても、cols に数を書かない。auto-fit のまま、ページの padding を引いた 640px ほどの幅でその数が並ぶ minItemSize を選ぶ（2列なら 64、3列なら 48）。',
  'Card は、中身が数字だけでも cols に数を書いて並べない。cols に数を書くのは、電卓のキーのように列の数そのものに意味があり、Card に包まない1語ほどの要素（ボタン・アイコン・数字）を並べるときだけにし、4 までにする。それ以外の短い要素を並べるときも auto-fit にし、minItemSize を 24 か 32 にする。Stack の direction: "row" は折り返さないので、横に並べるのは、ボタン2〜3個や、アイコンと短いラベルのように、300px でも1行に収まる要素だけにする。',
  'Alert と Callout は、ページやセクションの幅いっぱいの段に置き、Grid で並べた Card の中には入れない。並べたカードの中の状態や機能の一覧は、1つ 15 字ほどまでの短い句にして Badge で示し、いくつもあるときは Stack（direction: "column"、align: "start"）で縦に並べる。カードに共通する注意書きは、並びの外に1つだけ置く。',
  'Grid で並べる Card は size を "sm" か "md" にし、Card の中に Card を入れない。',
  'Calendar は 300px ほどの幅を取って縮まないので、並べたカードの中や Stack の row に置かない。Stepper を横に並べる（orientation を書かない）のは、段が3つまでで、どの段も description を持たず、label が4字ほどまでのときだけにし、それ以外は orientation: "vertical" にする。Carousel の slideSize は "full" か "lg" にする。',
  'Table と DataTable は、枠が狭くても横にスクロールせず、列を詰めてセルの文を1字ずつでも折り返す。300px ほどの枠でも収まるよう、列は2つまでにし、セルは数字か6字ほどまでの語にする。列が3つ以上要るときや、セルに長い語や文が入るときは、Table にせず、行ごとに Card を作り、Grid の auto-fit（minItemSize 64）で並べる。',
];

export const buildSpecSystemPrompt = (
  input: BuildSpecSystemPromptInput = {},
): string => {
  const sections = [
    catalog.prompt({
      // oxlint-disable-next-line typescript/no-deprecated -- 非推奨なのは旧別名の'generate'/'chat'だが、@deprecatedがmodeプロパティ自体に付いているため現行値の'inline'でも警告が出る
      mode: 'inline',
      system: K8O_SYSTEM,
      customRules: [...uiRules, ...RESPONSE_RULES, ...LAYOUT_RULES],
    }),
  ];

  if (hasText(input.repairPrompt)) {
    sections.push(
      [
        '# 前回の出力は検証エラーになった。次の指摘をすべて解消した spec を出力すること',
        input.repairPrompt,
      ].join('\n'),
    );
  }

  return sections.join('\n\n');
};
