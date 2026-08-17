import type { Spec, UIElement } from '@json-render/core';

// spec を arte-odyssey の実 API に沿った TSX へ機械変換する。壁打ちの成果物を
// 実プロジェクトへ持ち出すためのスキャフォールドで、対応表は
// @k8o/arte-odyssey/json-render/registry の描画実装（renderers）を正とする。
// フォーム値の state 配線・動的値（$state 等）は移植先で行う前提。

// catalog の Icon.name → 実コンポーネント名（registry の iconMap と同じ対応）。
const ICON_COMPONENTS: Record<string, string> = {
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
        `<Stack${attrs(el, ['direction', 'gap', 'padding', 'align', 'justify'], ctx)}>`,
        emitChildren(el, ctx),
        '</Stack>',
      );
    }
    case 'Grid': {
      ctx.imports.add('Grid');
      return wrap(
        `<Grid${attrs(el, ['cols', 'minItemSize', 'gap'], ctx)}>`,
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
        `<Card${attrs(el, ['appearance', 'interactive', 'width'], ctx)}>`,
        wrap(`<div className="${padding}">`, emitChildren(el, ctx), '</div>'),
        '</Card>',
      );
    }
    case 'Button': {
      ctx.imports.add('Button');
      const { href } = el.props;
      const base = attrs(el, ['color', 'variant', 'size', 'fullWidth'], ctx);
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
        `<Heading${attrs(el, ['type', 'lineClamp'], ctx, { type: level })}>${escapeText(textProp(el, 'text', ctx))}</Heading>`,
      ];
    }
    case 'Badge': {
      ctx.imports.add('Badge');
      return [
        `<Badge${attrs(el, ['text', 'tone', 'variant', 'size'], ctx)} />`,
      ];
    }
    case 'Alert': {
      ctx.imports.add('Alert');
      return [`<Alert${attrs(el, ['tone', 'message'], ctx)} />`];
    }
    case 'Spinner': {
      ctx.imports.add('Spinner');
      return [`<Spinner${attrs(el, ['label', 'size'], ctx)} />`];
    }
    case 'Separator': {
      ctx.imports.add('Separator');
      return [`<Separator${attrs(el, ['orientation', 'color'], ctx)} />`];
    }
    case 'Skeleton': {
      ctx.imports.add('Skeleton');
      return [`<Skeleton${attrs(el, ['shape', 'size', 'animate'], ctx)} />`];
    }
    case 'Progress': {
      ctx.imports.add('Progress');
      return [
        `<Progress${attrs(el, ['progress', 'maxProgress', 'minProgress', 'label'], ctx)} />`,
      ];
    }
    case 'Avatar': {
      ctx.imports.add('Avatar');
      return [
        `<Avatar${attrs(el, ['name', 'src', 'alt', 'fallback', 'size'], ctx)} />`,
      ];
    }
    case 'Anchor': {
      ctx.imports.add('Anchor');
      return [
        `<Anchor${attrs(el, ['href', 'openInNewTab'], ctx)}>${escapeText(textProp(el, 'text', ctx))}</Anchor>`,
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
      return [`<${component}${attrs(el, ['size'], ctx)} />`];
    }
    case 'ChevronIcon': {
      ctx.imports.add('ChevronIcon');
      return [`<ChevronIcon${attrs(el, ['direction', 'size'], ctx)} />`];
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
        `<IconButton${attrs(el, ['label', 'color', 'size'], ctx)}>`,
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
      const inputAttrs = attrs(
        el,
        ['name', 'placeholder', 'defaultValue'],
        ctx,
      );
      return [
        `<FormControl${attrs(el, ['label', 'required', 'helpText', 'errorText', 'invalid'], ctx)}`,
        '  renderInput={(props) => (',
        `    <${inputComponent} {...props}${inputAttrs} />`,
        '  )}',
        '/>',
      ];
    }
    case 'TextField':
    case 'Textarea':
    case 'PasswordInput': {
      ctx.imports.add(el.type);
      return [
        `<${el.type}${attrs(el, ['name', 'placeholder', 'defaultValue', 'invalid', 'disabled', 'readOnly'], ctx)} />`,
      ];
    }
    case 'NumberField': {
      ctx.imports.add('NumberField');
      return [
        `<NumberField${attrs(el, ['name', 'defaultValue', 'min', 'max', 'step'], ctx)} />`,
      ];
    }
    case 'Checkbox':
    case 'Switch': {
      ctx.imports.add(el.type);
      return [
        `<${el.type}${attrs(el, ['label', 'name', 'defaultChecked', 'disabled'], ctx)} />`,
      ];
    }
    case 'Select':
    case 'Radio':
    case 'RadioCard':
    case 'CheckboxCard':
    case 'CheckboxGroup':
    case 'ListBox':
    case 'Autocomplete': {
      ctx.imports.add(el.type);
      return [
        `<${el.type}${attrs(el, ['name', 'options', 'defaultValue', 'invalid', 'disabled'], ctx)} />`,
      ];
    }
    case 'Slider': {
      ctx.imports.add('Slider');
      return [
        `<Slider${attrs(el, ['name', 'defaultValue', 'min', 'max', 'step'], ctx)} />`,
      ];
    }
    case 'Form': {
      ctx.imports.add('Form');
      return wrap('<Form>', emitChildren(el, ctx), '</Form>');
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
    lines.push(
      `import { ${importNames.join(', ')} } from '@k8o/arte-odyssey';`,
      '',
    );
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
