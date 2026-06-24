import { tokens } from '@k8o/arte-odyssey/tokens';

// arte-odyssey のトークンから「生成コードで使ってよいクラスの語彙」を自動生成し、プロンプトと実体のズレ（存在しないクラスのハルシネーション）を防ぐ。標準 Tailwind カラーは語彙に含めない＝使わせない。
// tokens.theme.<namespace> はトークン名をキーに持つオブジェクトで、キー名がクラスの語幹になる。
const colorRefs: readonly string[] = Object.keys(tokens.theme.color);
const radiusRefs: readonly string[] = Object.keys(tokens.theme.radius);
const textRefs: readonly string[] = Object.keys(tokens.theme.text);
const fontRefs: readonly string[] = Object.keys(tokens.theme.font);
const fontWeightRefs: readonly string[] = Object.keys(
  tokens.theme['font-weight'],
);

// 色以外の特殊トークン（透明・バックドロップ・グループ配色）はプロンプト語彙から除く
const SPECIAL_COLORS = new Set(['transparent', 'back-drop']);
const usableColors = colorRefs.filter(
  (color) => !SPECIAL_COLORS.has(color) && !color.startsWith('group-'),
);

export const textColorClasses: readonly string[] = usableColors
  .filter((color) => color.includes('fg'))
  .map((color) => `text-${color}`);

export const bgColorClasses: readonly string[] = usableColors
  .filter((color) => color.includes('bg'))
  .map((color) => `bg-${color}`);

export const borderColorClasses: readonly string[] = usableColors
  .filter((color) => color.includes('border'))
  .map((color) => `border-${color}`);

export const radiusClasses: readonly string[] = radiusRefs.map(
  (radius) => `rounded-${radius}`,
);

export const textSizeClasses: readonly string[] = textRefs
  .filter((size) => size !== 'emphasize' && size !== 'highlight')
  .map((size) => `text-${size}`);

export const fontWeightClasses: readonly string[] = fontWeightRefs.map(
  (weight) => `font-${weight}`,
);

export const fontFamilyClasses: readonly string[] = fontRefs.map(
  (font) => `font-${font}`,
);

// arte-odyssey の主要コンポーネント（barrel export より v10.2.0 で抽出）。major 更新時に手動 refresh。
export const componentAllowlist: readonly string[] = [
  'Accordion',
  'Alert',
  'Anchor',
  'Autocomplete',
  'Avatar',
  'Badge',
  'BaselineStatus',
  'Breadcrumb',
  'Button',
  'Card',
  'Checkbox',
  'CheckboxCard',
  'CheckboxGroup',
  'Code',
  'Dialog',
  'Drawer',
  'DropdownMenu',
  'FileField',
  'Form',
  'FormControl',
  'Grid',
  'Heading',
  'IconButton',
  'ListBox',
  'Modal',
  'NumberField',
  'Pagination',
  'PasswordInput',
  'Popover',
  'Progress',
  'Radio',
  'RadioCard',
  'ScrollLinked',
  'Select',
  'Separator',
  'Skeleton',
  'Slider',
  'Spinner',
  'Stack',
  'Switch',
  'Table',
  'Tabs',
  'TextField',
  'Textarea',
  'Tooltip',
];

// arte-odyssey が実際に export するアイコン名（barrel より v10.2.0 で抽出）。実在名のみを語彙として渡し、他ライブラリ由来の名前（BellIcon 等）を幻覚 import するのを封じる。major 更新時に手動 refresh。
export const iconAllowlist: readonly string[] = [
  'AIIcon',
  'AccessibilityIcon',
  'AlertIcon',
  'AtomIcon',
  'BadIcon',
  'BlogIcon',
  'BoringIcon',
  'CheckIcon',
  'ChevronIcon',
  'CloseIcon',
  'ColorContrastIcon',
  'ColorInfoIcon',
  'CopyIcon',
  'DarkModeIcon',
  'DifficultIcon',
  'EasyIcon',
  'ExternalLinkIcon',
  'FlaskIcon',
  'FormIcon',
  'GitHubIcon',
  'GoodIcon',
  'HistoryIcon',
  'HorizontalWritingIcon',
  'InformativeIcon',
  'InterestingIcon',
  'LightModeIcon',
  'LinkIcon',
  'ListIcon',
  'LocationIcon',
  'LogoIcon',
  'MailIcon',
  'MinusIcon',
  'MixedColorIcon',
  'NavigationMenuIcon',
  'NewsIcon',
  'PackageIcon',
  'PaletteIcon',
  'PlusIcon',
  'PrepareIcon',
  'PublishDateIcon',
  'QiitaIcon',
  'RSSIcon',
  'SendIcon',
  'ShallowIcon',
  'ShieldCheckIcon',
  'SlideIcon',
  'SparklesIcon',
  'SquircleIcon',
  'SubscribeIcon',
  'TableIcon',
  'TagIcon',
  'TwitterIcon',
  'UpdateDateIcon',
  'VerticalWritingIcon',
  'ViewIcon',
  'ViewOffIcon',
];

// 実 prop を arte-odyssey の .d.mts から抽出・要約した API リファレンス。prop の取り違え（renderInput 不在・存在しない variant）による runtime エラー→白画面を防ぐ。major 更新時に手動 refresh（抽出元: dist/components/**/<name>.d.mts）。
export const componentApiReference: string = [
  '- Heading: <Heading type="h1"|"h2"|..|"h6">テキスト</Heading>',
  '- Card: <Card appearance="shadow"|"bordered">…</Card>（内側パディングは持たない。<div className="p-8"> で包む）',
  '- Stack: <Stack direction="row"|"column" gap="2xs".."3xl" align="start"|"center"|"end"|"stretch" justify="start"|"center"|"end"|"between" padding="…">…</Stack>',
  '- Grid: <Grid cols={1|2|3|4|5|6} gap="md">…</Grid>',
  '- Button: <Button color="primary"|"secondary"|"gray" variant="solid"|"outline"|"skeleton" size="sm"|"md"|"lg" startIcon={<Icon/>}>ラベル</Button>（color に "neutral"/"danger"、variant に "ghost"/"subtle" は存在しない）',
  '- IconButton: <IconButton label="必須:操作の説明" color="base"|"primary"|"secondary"|"transparent" size="md"><Icon/></IconButton>',
  '- Badge: <Badge text="ラベル" tone="neutral"|"info"|"success"|"warning"|"error" variant="solid"|"outline" size="md" />（children ではなく text 必須。color/subtle は無い）',
  '- Alert: <Alert tone="neutral"|"info"|"success"|"warning"|"error" message="本文" />（children ではなく message 必須）',
  '- Avatar: <Avatar name="氏名" src="url" fallback="AB" size="sm"|"md"|"lg" />',
  '- Separator: <Separator orientation="horizontal"|"vertical" color="base"|"mute"|"subtle" />',
  '- Spinner: <Spinner label="読み込み中" size="md" /> / Skeleton: <Skeleton shape="rect"|"circle" size="md" />',
  '- Progress: <Progress progress={60} maxProgress={100} label="進捗" />',
  '- Code: <Code>{`const x = 1;`}</Code>（children は文字列のみ）',
  '- 入力フォーム: 入力要素は必ず FormControl の renderInput 経由で組む（children に input を直接置かない）:',
  '    <FormControl label="お名前" required helpText="…" errorText="…" renderInput={(props) => <TextField {...props} type="email" placeholder="…" />} />',
  '  入力要素は TextField / Textarea / NumberField / PasswordInput（いずれも renderInput の props を展開）。',
  '- Select / Radio / Autocomplete: options 配列を渡す。各要素は { key: string, label: string }（items や {value} ではない）:',
  '    <FormControl label="種別" renderInput={(props) => <Select {...props} options={[{ key: "general", label: "一般" }]} />} />',
  '- Switch / Checkbox: label を prop で渡す（<Switch label="通知を受け取る" />）。',
  '- Dialog / Drawer / Modal / Popover / DropdownMenu / Tabs / Accordion / Breadcrumb / Pagination / Table は複合コンポーネント（トリガ/サブ要素を組み合わせる）。API に自信が無ければ使わず、素の <div> + トークンで組む。',
].join('\n');

// プロンプトには出さないが import 自体は正当な export。検証で誤って弾かないよう known セットに含める。
const utilityExports: readonly string[] = [
  'ArteOdyssey',
  'ArteOdysseyProvider',
  'Logo',
  'PortalRootProvider',
  'ToastProvider',
  'chain',
  'cn',
  'createSafeContext',
  'mergeProps',
  'mergeRefs',
  'useBreakpoint',
  'useClickAway',
  'useClient',
  'useClipboard',
  'useControllableState',
  'useDebouncedTransition',
  'useDeferredDebounce',
  'useDisclosure',
  'useHash',
  'useHover',
  'useInView',
  'useIntersectionObserver',
  'useInterval',
  'useLocalStorage',
  'useOpenContext',
  'usePortalRoot',
  'useResize',
  'useScrollDirection',
  'useScrollLock',
  'useSessionStorage',
  'useStep',
  'useTimeout',
  'useToast',
  'useWindowResize',
  'useWindowSize',
  'useWritingMode',
];

// '@k8o/arte-odyssey' が実際に export する全名称。生成コードの import 検証に使う。
const knownArteExports: ReadonlySet<string> = new Set([
  ...componentAllowlist,
  ...iconAllowlist,
  ...utilityExports,
]);

// '@k8o/arte-odyssey'（barrel）からの named import を抽出する。サブパス（/tokens 等）は対象外。
const ARTE_IMPORT_RE =
  /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]@k8o\/arte-odyssey['"]/gu;

// '@k8o/arte-odyssey' から存在しない名前を import していないか検証し未知名を返す（空なら健全）。書き込み前に弾き、存在しない import による Vite のモジュール崩壊（プレビュー白画面）を防ぐ。
export const findUnknownArteImports = (code: string): readonly string[] => {
  const unknown = new Set<string>();
  for (const match of code.matchAll(ARTE_IMPORT_RE)) {
    const clause = match[1];
    if (clause === undefined) {
      continue;
    }
    for (const raw of clause.split(',')) {
      // `Foo as Bar` は実体名（Foo）を検証対象にする。
      const name = raw
        .trim()
        .split(/\s+as\s+/u)[0]
        ?.trim();
      if (name === undefined || name === '') {
        continue;
      }
      if (!knownArteExports.has(name)) {
        unknown.add(name);
      }
    }
  }
  return [...unknown];
};
