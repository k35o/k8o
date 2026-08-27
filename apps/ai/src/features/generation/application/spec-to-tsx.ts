import type { Spec, UIElement } from '@json-render/core';

// spec を @k8ordo/ui の実 API に沿った TSX へ機械変換する。壁打ちの成果物を
// 実プロジェクトへ持ち出すためのスキャフォールドで、対応表は
// @k8ordo/ui/json-render/registry の描画実装（renderers）を正とする。
// フォーム値の state 配線・動的値（$state 等）は移植先で行う前提。

// catalog の Icon.name → 実コンポーネント名（registry の iconMap と同じ対応）。
// catalog との1対1対応は spec-to-tsx.test.ts のドリフト検知テストが照合する。
export const ICON_COMPONENTS: Record<string, string> = {
  plus: 'PlusIcon',
  minus: 'MinusIcon',
  check: 'CheckIcon',
  close: 'CloseIcon',
  copy: 'CopyIcon',
  send: 'SendIcon',
  mail: 'MailIcon',
  subscribe: 'SubscribeIcon',
  rss: 'RSSIcon',
  history: 'HistoryIcon',
  'update-date': 'UpdateDateIcon',
  'publish-date': 'PublishDateIcon',
  link: 'LinkIcon',
  'external-link': 'ExternalLinkIcon',
  location: 'LocationIcon',
  'navigation-menu': 'NavigationMenuIcon',
  list: 'ListIcon',
  table: 'TableIcon',
  form: 'FormIcon',
  view: 'ViewIcon',
  'view-off': 'ViewOffIcon',
  'light-mode': 'LightModeIcon',
  'dark-mode': 'DarkModeIcon',
  palette: 'PaletteIcon',
  'color-contrast': 'ColorContrastIcon',
  'color-info': 'ColorInfoIcon',
  'mixed-color': 'MixedColorIcon',
  'horizontal-writing': 'HorizontalWritingIcon',
  'vertical-writing': 'VerticalWritingIcon',
  tag: 'TagIcon',
  blog: 'BlogIcon',
  news: 'NewsIcon',
  slide: 'SlideIcon',
  sparkles: 'SparklesIcon',
  ai: 'AIIcon',
  atom: 'AtomIcon',
  accessibility: 'AccessibilityIcon',
  'shield-check': 'ShieldCheckIcon',
  prepare: 'PrepareIcon',
  informative: 'InformativeIcon',
  good: 'GoodIcon',
  bad: 'BadIcon',
  easy: 'EasyIcon',
  difficult: 'DifficultIcon',
  interesting: 'InterestingIcon',
  boring: 'BoringIcon',
  shallow: 'ShallowIcon',
  logo: 'LogoIcon',
  github: 'GitHubIcon',
  twitter: 'TwitterIcon',
  qiita: 'QiitaIcon',
};

// Card の size → 内側パディング（registry の CARD_PADDING_CLASS と同じ対応）。
const CARD_PADDING: Record<string, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

// 複数の case が共有する prop 列は定数にする。case をまとめたまま片方の
// コンポーネント名で CONVERTED_PROPS を引くと、catalog が片側だけ変わったときに
// 表と switch がずれてもテストが素通りするため。
const TEXT_INPUT_PROPS = [
  'name',
  'placeholder',
  'defaultValue',
  'invalid',
  'disabled',
] as const;
const CHOICE_CARD_PROPS = [
  'name',
  'options',
  'defaultValue',
  'invalid',
  'disabled',
] as const;
const OPTION_INPUT_PROPS = [
  'name',
  'options',
  'defaultValue',
  'invalid',
  'disabled',
] as const;
// 1要素を複数タグへ展開するものは部位ごとに持ち、CONVERTED_PROPS ではその和を宣言する。
const FORM_CONTROL_FIELD_PROPS = [
  'label',
  'required',
  'helpText',
  'errorText',
  'invalid',
] as const;
const FORM_CONTROL_INPUT_PROPS = [
  'name',
  'placeholder',
  'defaultValue',
] as const;
const LIST_BOX_ROOT_PROPS = ['options', 'defaultValue'] as const;
const LIST_BOX_TRIGGER_PROPS = ['label'] as const;

// emitElement が attrs() でそのまま JSX 属性へ変換する prop。
// catalog に無い prop の混入は spec-to-tsx.test.ts のドリフト検知テストが照合する。
export const CONVERTED_PROPS = {
  Stack: ['direction', 'gap', 'padding', 'align', 'justify'],
  Grid: ['cols', 'minItemSize', 'gap'],
  Card: ['variant', 'interactive', 'width'],
  Button: ['color', 'variant', 'size', 'fullWidth'],
  Heading: ['level', 'lineClamp'],
  Badge: ['label', 'tone', 'variant', 'size'],
  Alert: ['tone', 'message'],
  Spinner: ['label', 'size'],
  Separator: ['orientation', 'color'],
  Skeleton: ['shape', 'size', 'animate'],
  Progress: ['value', 'max', 'min', 'label'],
  Avatar: ['name', 'src', 'alt', 'fallback', 'size'],
  Anchor: ['href', 'openInNewTab'],
  Code: [],
  Icon: ['size'],
  ChevronIcon: ['direction', 'size'],
  IconButton: ['label', 'color', 'size'],
  FormControl: [...FORM_CONTROL_FIELD_PROPS, ...FORM_CONTROL_INPUT_PROPS],
  TextField: [...TEXT_INPUT_PROPS, 'readOnly'],
  Textarea: [...TEXT_INPUT_PROPS, 'readOnly', 'rows', 'autoResize'],
  PasswordInput: TEXT_INPUT_PROPS,
  NumberField: [
    'name',
    'defaultValue',
    'min',
    'max',
    'step',
    'invalid',
    'disabled',
  ],
  Slider: ['name', 'defaultValue', 'min', 'max', 'step', 'invalid', 'disabled'],
  Checkbox: ['label', 'name', 'defaultChecked', 'disabled'],
  Switch: [
    'label',
    'name',
    'defaultChecked',
    'disabled',
    'invalid',
    'required',
  ],
  Radio: ['name', 'options', 'defaultValue', 'disabled'],
  RadioCard: CHOICE_CARD_PROPS,
  CheckboxCard: CHOICE_CARD_PROPS,
  CheckboxGroup: ['name', 'defaultValue'],
  Select: OPTION_INPUT_PROPS,
  Autocomplete: OPTION_INPUT_PROPS,
  ListBox: [...LIST_BOX_ROOT_PROPS, ...LIST_BOX_TRIGGER_PROPS],
  Form: ['action'],
} as const satisfies Record<string, readonly string[]>;

// catalog にはあるが attrs() では出さない prop。JSX 属性以外の形へ変換するもの。
// CONVERTED_PROPS との和が catalog の prop 全体を覆うことをテストが照合するので、
// arte-odyssey が prop を増やしたらどちらかに足すまでテストが赤くなる。
export const EXCLUDED_PROPS = {
  // 内側 div の padding へ
  Card: ['size'],
  // label は子テキストへ、href は renderItem のリンクへ
  Button: ['label', 'href'],
  // 子テキストへ
  Heading: ['label'],
  Anchor: ['label'],
  Code: ['code'],
  // アイコンコンポーネント名へ（ICON_COMPONENTS）
  Icon: ['name'],
  IconButton: ['icon'],
  // renderInput に置く入力コンポーネントの選択へ
  FormControl: ['fieldType'],
  // グループ入力の label は見出し span へ（emitLabeledGroup）
  Radio: ['label'],
  RadioCard: ['label'],
  CheckboxCard: ['label'],
  // options は CheckboxGroup.Item 群へ
  CheckboxGroup: ['label', 'options'],
  // 実 ListBox.Root に name が無く registry も渡していない
  ListBox: ['name'],
} as const satisfies Partial<
  Record<keyof typeof CONVERTED_PROPS, readonly string[]>
>;

type Ctx = {
  spec: Spec;
  imports: Set<string>;
  notes: Set<string>;
};

// $state / $cond / $template / $bindState / $item 等の動的値か。
const isDynamicValue = (value: unknown): boolean =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.keys(value).some((key) => key.startsWith('$'));

const escapeText = (text: string): string =>
  /[<>{}]/u.test(text) ? `{${JSON.stringify(text)}}` : text;

const escapeAttrString = (text: string): string =>
  text.includes('"') ? `{${JSON.stringify(text)}}` : `"${text}"`;

// 1 属性ぶんの文字列を作る。undefined と動的値は null（=属性を出さない）。
const attr = (name: string, value: unknown, ctx: Ctx): string | null => {
  if (value === undefined) {
    return null;
  }
  if (isDynamicValue(value)) {
    ctx.notes.add(
      `${name} に動的値（$state 等）が使われていたため省略した。移植先で配線すること。`,
    );
    return null;
  }
  if (value === true) {
    return name;
  }
  if (typeof value === 'string') {
    return `${name}=${escapeAttrString(value)}`;
  }
  return `${name}={${JSON.stringify(value)}}`;
};

const attrs = (
  el: UIElement,
  names: readonly string[],
  ctx: Ctx,
  overrides: Record<string, unknown> = {},
): string => {
  const parts: string[] = [];
  for (const name of names) {
    const rendered = attr(name, overrides[name] ?? el.props[name], ctx);
    if (rendered !== null) {
      parts.push(rendered);
    }
  }
  return parts.length === 0 ? '' : ` ${parts.join(' ')}`;
};

const indentLines = (lines: string[], depth: number): string[] =>
  lines.map((line) => (line === '' ? line : `${'  '.repeat(depth)}${line}`));

// テキストとして JSX の子に埋め込む prop。動的値なら省略して NOTE を残す。
const textProp = (el: UIElement, name: string, ctx: Ctx): string => {
  const value = el.props[name];
  if (typeof value === 'string') {
    return value;
  }
  if (isDynamicValue(value)) {
    ctx.notes.add(
      `${name} に動的値（$state 等）が使われていたため省略した。移植先で配線すること。`,
    );
  }
  return '';
};

// 子要素キー列を TSX 行へ。存在しないキーは無視する。
const emitChildren = (el: UIElement, ctx: Ctx): string[] => {
  const lines: string[] = [];
  for (const key of el.children ?? []) {
    const child = ctx.spec.elements[key];
    if (child !== undefined) {
      lines.push(...emitElement(child, ctx));
    }
  }
  return lines;
};

const wrap = (open: string, children: string[], close: string): string[] =>
  children.length === 0
    ? [open.replace(/>$/u, ' />')]
    : [open, ...indentLines(children, 1), close];

// registry の LabeledField と同じ「見出し span + aria-labelledby」へ展開する。
// v12 でグループ入力は aria-labelledby が必須になり、素で置くと名前が付かない。
const emitLabeledGroup = (
  el: UIElement,
  ctx: Ctx,
  renderField: (labelId: string) => string[],
): string[] => {
  const name = textProp(el, 'name', ctx);
  const labelId = `${name === '' ? el.type.toLowerCase() : name}-label`;
  return wrap(
    '<div className="flex flex-col gap-1">',
    [
      `<span className="text-fg-base text-sm font-medium" id="${labelId}">${escapeText(textProp(el, 'label', ctx))}</span>`,
      ...renderField(labelId),
    ],
    '</div>',
  );
};

const emitCheckboxGroupItems = (el: UIElement, ctx: Ctx): string[] => {
  const { options } = el.props;
  if (!Array.isArray(options)) {
    ctx.notes.add(
      'options に動的値（$state 等）が使われていたため省略した。移植先で配線すること。',
    );
    return [];
  }
  return options.map((option: { value?: string; label?: string }) => {
    const itemValue = attr('itemValue', option.value, ctx);
    const label = attr('label', option.label, ctx);
    return `<CheckboxGroup.Item ${[itemValue, label].filter((part) => part !== null).join(' ')} />`;
  });
};

const emitElement = (el: UIElement, ctx: Ctx): string[] => {
  // 表示条件・繰り返し・アクションは TSX へ機械変換しない（挙動の移植は手動）。
  if (el.visible !== undefined || el.repeat !== undefined) {
    ctx.notes.add(
      'visible / repeat を持つ要素があった。条件表示・繰り返しは移植先で実装すること。',
    );
  }
  switch (el.type) {
    case 'Stack': {
      ctx.imports.add('Stack');
      return wrap(
        `<Stack${attrs(el, CONVERTED_PROPS.Stack, ctx)}>`,
        emitChildren(el, ctx),
        '</Stack>',
      );
    }
    case 'Grid': {
      ctx.imports.add('Grid');
      return wrap(
        `<Grid${attrs(el, CONVERTED_PROPS.Grid, ctx)}>`,
        emitChildren(el, ctx),
        '</Grid>',
      );
    }
    case 'Card': {
      ctx.imports.add('Card');
      const size =
        typeof el.props['size'] === 'string' ? el.props['size'] : 'md';
      const padding = CARD_PADDING[size] ?? 'p-6';
      return wrap(
        `<Card${attrs(el, CONVERTED_PROPS.Card, ctx)}>`,
        wrap(`<div className="${padding}">`, emitChildren(el, ctx), '</div>'),
        '</Card>',
      );
    }
    case 'Button': {
      ctx.imports.add('Button');
      const { href } = el.props;
      const base = attrs(el, CONVERTED_PROPS.Button, ctx);
      const label = escapeText(textProp(el, 'label', ctx));
      if (typeof href === 'string' && href !== '') {
        // href 付きは renderItem でリンクとして描画する（実 Button の作法）。
        return [
          `<Button${base}`,
          '  renderItem={({ className, children }) => (',
          `    <a className={className} href=${escapeAttrString(href)}>`,
          '      {children}',
          '    </a>',
          '  )}',
          '>',
          `  ${label}`,
          '</Button>',
        ];
      }
      // href は attrs() の共通経路を通らないため、動的値の検知もここで行う
      // （黙って落とすとリンクの移植漏れに気づけない）。
      if (isDynamicValue(href)) {
        ctx.notes.add(
          'href に動的値（$state 等）が使われていたため省略した。移植先で配線すること。',
        );
      }
      return [`<Button${base}>${label}</Button>`];
    }
    case 'Heading': {
      ctx.imports.add('Heading');
      const level =
        typeof el.props['level'] === 'string' ? el.props['level'] : 'h2';
      return [
        `<Heading${attrs(el, CONVERTED_PROPS.Heading, ctx, { level })}>${escapeText(textProp(el, 'label', ctx))}</Heading>`,
      ];
    }
    case 'Badge': {
      ctx.imports.add('Badge');
      return [`<Badge${attrs(el, CONVERTED_PROPS.Badge, ctx)} />`];
    }
    case 'Alert': {
      ctx.imports.add('Alert');
      return [`<Alert${attrs(el, CONVERTED_PROPS.Alert, ctx)} />`];
    }
    case 'Spinner': {
      ctx.imports.add('Spinner');
      return [`<Spinner${attrs(el, CONVERTED_PROPS.Spinner, ctx)} />`];
    }
    case 'Separator': {
      ctx.imports.add('Separator');
      return [`<Separator${attrs(el, CONVERTED_PROPS.Separator, ctx)} />`];
    }
    case 'Skeleton': {
      ctx.imports.add('Skeleton');
      return [`<Skeleton${attrs(el, CONVERTED_PROPS.Skeleton, ctx)} />`];
    }
    case 'Progress': {
      ctx.imports.add('Progress');
      return [`<Progress${attrs(el, CONVERTED_PROPS.Progress, ctx)} />`];
    }
    case 'Avatar': {
      ctx.imports.add('Avatar');
      return [`<Avatar${attrs(el, CONVERTED_PROPS.Avatar, ctx)} />`];
    }
    case 'Anchor': {
      ctx.imports.add('Anchor');
      return [
        `<Anchor${attrs(el, CONVERTED_PROPS.Anchor, ctx)}>${escapeText(textProp(el, 'label', ctx))}</Anchor>`,
      ];
    }
    case 'Code': {
      ctx.imports.add('Code');
      return [`<Code>{${JSON.stringify(textProp(el, 'code', ctx))}}</Code>`];
    }
    case 'Icon': {
      const name = textProp(el, 'name', ctx);
      const component = ICON_COMPONENTS[name];
      if (component === undefined) {
        ctx.notes.add(`未知のアイコン名: ${name}`);
        return [`{/* TODO: Icon(${name}) */}`];
      }
      ctx.imports.add(component);
      return [`<${component}${attrs(el, CONVERTED_PROPS.Icon, ctx)} />`];
    }
    case 'ChevronIcon': {
      ctx.imports.add('ChevronIcon');
      return [`<ChevronIcon${attrs(el, CONVERTED_PROPS.ChevronIcon, ctx)} />`];
    }
    case 'IconButton': {
      const icon = textProp(el, 'icon', ctx);
      const component = ICON_COMPONENTS[icon];
      ctx.imports.add('IconButton');
      const iconJsx =
        component === undefined
          ? `{/* TODO: Icon(${icon}) */}`
          : `<${component} size="md" />`;
      if (component !== undefined) {
        ctx.imports.add(component);
      }
      return wrap(
        `<IconButton${attrs(el, CONVERTED_PROPS.IconButton, ctx)}>`,
        [iconJsx],
        '</IconButton>',
      );
    }
    case 'FormControl': {
      // registry の FormControlWidget と同じく renderInput パターンへ展開する。
      ctx.imports.add('FormControl');
      const fieldType =
        typeof el.props['fieldType'] === 'string'
          ? el.props['fieldType']
          : 'text';
      const inputComponent =
        fieldType === 'textarea'
          ? 'Textarea'
          : fieldType === 'password'
            ? 'PasswordInput'
            : 'TextField';
      ctx.imports.add(inputComponent);
      const inputAttrs = attrs(el, FORM_CONTROL_INPUT_PROPS, ctx);
      return [
        `<FormControl${attrs(el, FORM_CONTROL_FIELD_PROPS, ctx)}`,
        '  renderInput={(props) => (',
        `    <${inputComponent} {...props}${inputAttrs} />`,
        '  )}',
        '/>',
      ];
    }
    case 'TextField': {
      ctx.imports.add('TextField');
      return [`<TextField${attrs(el, CONVERTED_PROPS.TextField, ctx)} />`];
    }
    case 'Textarea': {
      ctx.imports.add('Textarea');
      return [`<Textarea${attrs(el, CONVERTED_PROPS.Textarea, ctx)} />`];
    }
    case 'PasswordInput': {
      // catalog の PasswordInput は readOnly を持たない（TextField / Textarea との差分）。
      ctx.imports.add('PasswordInput');
      return [
        `<PasswordInput${attrs(el, CONVERTED_PROPS.PasswordInput, ctx)} />`,
      ];
    }
    case 'NumberField': {
      ctx.imports.add('NumberField');
      return [`<NumberField${attrs(el, CONVERTED_PROPS.NumberField, ctx)} />`];
    }
    case 'Slider': {
      ctx.imports.add('Slider');
      return [`<Slider${attrs(el, CONVERTED_PROPS.Slider, ctx)} />`];
    }
    case 'Checkbox': {
      ctx.imports.add('Checkbox');
      return [`<Checkbox${attrs(el, CONVERTED_PROPS.Checkbox, ctx)} />`];
    }
    case 'Switch': {
      ctx.imports.add('Switch');
      return [`<Switch${attrs(el, CONVERTED_PROPS.Switch, ctx)} />`];
    }
    case 'Radio': {
      // catalog の Radio は invalid を持たない（RadioCard / CheckboxCard との差分）。
      ctx.imports.add('Radio');
      return emitLabeledGroup(el, ctx, (labelId) => [
        `<Radio aria-labelledby="${labelId}"${attrs(el, CONVERTED_PROPS.Radio, ctx)} />`,
      ]);
    }
    case 'RadioCard':
    case 'CheckboxCard': {
      ctx.imports.add(el.type);
      return emitLabeledGroup(el, ctx, (labelId) => [
        `<${el.type} aria-labelledby="${labelId}"${attrs(el, CHOICE_CARD_PROPS, ctx)} />`,
      ]);
    }
    case 'CheckboxGroup': {
      ctx.imports.add('CheckboxGroup');
      return emitLabeledGroup(el, ctx, (labelId) =>
        wrap(
          `<CheckboxGroup.Root aria-labelledby="${labelId}"${attrs(el, CONVERTED_PROPS.CheckboxGroup, ctx)}>`,
          emitCheckboxGroupItems(el, ctx),
          '</CheckboxGroup.Root>',
        ),
      );
    }
    case 'Select':
    case 'Autocomplete': {
      ctx.imports.add(el.type);
      return [`<${el.type}${attrs(el, OPTION_INPUT_PROPS, ctx)} />`];
    }
    case 'ListBox': {
      // 実 ListBox は Root / Trigger / Content の組み立てで、フラットな1タグではない
      // （registry の renderListBox と同じ形）。
      ctx.imports.add('ListBox');
      return wrap(
        `<ListBox.Root${attrs(el, LIST_BOX_ROOT_PROPS, ctx)}>`,
        [
          `<ListBox.Trigger${attrs(el, LIST_BOX_TRIGGER_PROPS, ctx)} />`,
          '<ListBox.Content />',
        ],
        '</ListBox.Root>',
      );
    }
    case 'Form': {
      ctx.imports.add('Form');
      return wrap(
        `<Form${attrs(el, CONVERTED_PROPS.Form, ctx)}>`,
        emitChildren(el, ctx),
        '</Form>',
      );
    }
    default: {
      // 複合コンポーネント（Tabs / Table / Modal 等）は API の組み立てが必要なため
      // 機械変換しない。props を残して手動移植の手がかりにする。
      ctx.notes.add(`${el.type} は手動で移植すること。`);
      return [
        `{/* TODO: ${el.type} props=${JSON.stringify(el.props)} */}`,
        ...emitChildren(el, ctx),
      ];
    }
  }
};

export const specToTsx = (spec: Spec): string => {
  const ctx: Ctx = { spec, imports: new Set(), notes: new Set() };
  const root = spec.elements[spec.root];
  const body = root === undefined ? [] : emitElement(root, ctx);
  const importNames = [...ctx.imports].toSorted((a, b) => a.localeCompare(b));

  const lines: string[] = [];
  if (ctx.notes.size > 0) {
    lines.push(...[...ctx.notes].map((note) => `// NOTE: ${note}`), '');
  }
  if (importNames.length > 0) {
    lines.push(`import { ${importNames.join(', ')} } from '@k8ordo/ui';`, '');
  }
  lines.push(
    'export default function Preview() {',
    '  return (',
    ...indentLines(body, 2),
    '  );',
    '}',
  );
  return `${lines.join('\n')}\n`;
};
