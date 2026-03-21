# ArteOdyssey コンポーネント一覧

## インポート方法

```tsx
// スタイルシート（必須）
import '@k8o/arte-odyssey/styles.css';

// プロバイダー（アプリルートで1回）
import { ArteOdysseyProvider } from '@k8o/arte-odyssey/providers';

// 各コンポーネント（個別インポート）
import { Button } from '@k8o/arte-odyssey/button';
import { Card } from '@k8o/arte-odyssey/card';
```

## レイアウト・ナビゲーション

### Accordion

折りたたみ可能なセクション。

```tsx
import { Accordion, AccordionItem } from '@k8o/arte-odyssey/accordion';

<Accordion>
  <AccordionItem title="セクション1">
    コンテンツ
  </AccordionItem>
</Accordion>
```

### Breadcrumb

パンくずリスト。

```tsx
import { Breadcrumb, BreadcrumbItem } from '@k8o/arte-odyssey/breadcrumb';

<Breadcrumb>
  <BreadcrumbItem href="/">ホーム</BreadcrumbItem>
  <BreadcrumbItem href="/products">製品</BreadcrumbItem>
  <BreadcrumbItem>詳細</BreadcrumbItem>
</Breadcrumb>
```

### Card / InteractiveCard

コンテンツをグループ化するカード。

```tsx
import { Card, InteractiveCard } from '@k8o/arte-odyssey/card';

// 静的カード
<Card title="タイトル" variant="primary" width="full" appearance="shadow">
  <div className="p-6">コンテンツ</div>
</Card>

// クリック可能なカード（hover:scale-[1.02], active:scale-[0.98]）
<InteractiveCard title="記事" appearance="bordered">
  <div className="p-6">コンテンツ</div>
</InteractiveCard>
```

Props:
- `variant`: `'primary'` | `'secondary'`
- `title`: string
- `width`: `'full'` | `'fit'`
- `appearance`: `'shadow'` | `'bordered'`

### Tabs

タブ切り替え。

```tsx
import { Tabs, TabList, Tab, TabPanel } from '@k8o/arte-odyssey/tabs';

<Tabs>
  <TabList>
    <Tab>タブ1</Tab>
    <Tab>タブ2</Tab>
  </TabList>
  <TabPanel>パネル1</TabPanel>
  <TabPanel>パネル2</TabPanel>
</Tabs>
```

### Separator

区切り線。

```tsx
import { Separator } from '@k8o/arte-odyssey/separator';

<Separator />
<Separator color="mute" />
<Separator color="subtle" />
<Separator orientation="vertical" />
```

### ScrollLinked

スクロール進捗をプログレスバーで表示。

```tsx
import { ScrollLinked } from '@k8o/arte-odyssey/scroll-linked';

<ScrollLinked />
<ScrollLinked container={containerRef} />
```

## ボタン・リンク

### Button

```tsx
import { Button } from '@k8o/arte-odyssey/button';

<Button
  size="sm" | "md" | "lg"
  color="primary" | "gray"
  variant="contained" | "outlined" | "skeleton"
  fullWidth={false}
  startIcon={<Icon />}
  endIcon={<Icon />}
  disabled={false}
>
  ボタン
</Button>
```

### IconButton

アイコンのみのボタン。`bg` prop でスタイルを制御。

```tsx
import { IconButton } from '@k8o/arte-odyssey/icon-button';

<IconButton label="閉じる" bg="transparent" size="md">
  <XIcon />
</IconButton>
```

Props:
- `bg`: `'transparent'` | `'base'` | `'primary'`（デフォルト: `'transparent'`）
- `size`: `'sm'` | `'md'` | `'lg'`
- `label`: string（必須、aria-label として使用）

### LinkButton

リンクスタイルのボタン。Button と同じ `color` / `variant` props。

```tsx
import { LinkButton } from '@k8o/arte-odyssey/link-button';

<LinkButton href="/page" color="gray" variant="outlined">リンク</LinkButton>
```

### IconLink

アイコンのみのリンク。IconButton と同じ `bg` prop。

```tsx
import { IconLink } from '@k8o/arte-odyssey/icon-link';

<IconLink href="/home" bg="base" label="ホーム">
  <HomeIcon />
</IconLink>
```

### Anchor

テキストリンク。

```tsx
import { Anchor } from '@k8o/arte-odyssey/anchor';

<Anchor href="https://example.com" isExternal>
  外部リンク
</Anchor>
```

## フォーム

### TextField

```tsx
import { TextField } from '@k8o/arte-odyssey/text-field';

<TextField id="email" defaultValue="" placeholder="example@mail.com" />
```

### Textarea

```tsx
import { Textarea } from '@k8o/arte-odyssey/textarea';

<Textarea label="説明" rows={4} value={value} onChange={onChange} />
```

### Checkbox

```tsx
import { Checkbox } from '@k8o/arte-odyssey/checkbox';

<Checkbox checked={checked} onChange={onChange}>同意する</Checkbox>
```

### Radio

```tsx
import { Radio } from '@k8o/arte-odyssey/radio';

<Radio
  labelId="example-radio"
  name="example"
  onChange={onChange}
  options={[
    { value: 'a', label: '選択肢A' },
    { value: 'b', label: '選択肢B' },
  ]}
  value={value}
/>
```

### Select

```tsx
import { Select } from '@k8o/arte-odyssey/select';

<Select
  label="選択"
  options={[
    { value: '1', label: 'オプション1' },
    { value: '2', label: 'オプション2' },
  ]}
  value={value}
  onChange={onChange}
/>
```

### NumberField

```tsx
import { NumberField } from '@k8o/arte-odyssey/number-field';

<NumberField label="数量" min={0} max={100} value={value} onChange={onChange} />
```

### RangeField

```tsx
import { RangeField } from '@k8o/arte-odyssey/range-field';

<RangeField label="音量" min={0} max={100} value={value} onChange={onChange} />
```

### Autocomplete

```tsx
import { Autocomplete } from '@k8o/arte-odyssey/autocomplete';

<Autocomplete label="検索" options={options} value={value} onChange={onChange} />
```

### FileField

コンポジットパターンのファイルアップロード。

```tsx
import { FileField } from '@k8o/arte-odyssey/file-field';

<FileField.Root accept="image/*" multiple maxFiles={5}>
  <FileField.Trigger>ファイルを選択</FileField.Trigger>
  <FileField.ItemList />
</FileField.Root>
```

Props (Root):
- `accept`: string
- `multiple`: boolean
- `maxFiles`: number
- `isDisabled`, `isInvalid`, `isRequired`: boolean

### FormControl

フォームフィールドのラッパー（ラベル・エラー表示を統一）。

```tsx
import { FormControl } from '@k8o/arte-odyssey/form-control';

<FormControl label="ラベル" error="エラーメッセージ" isRequired>
  <TextField id="name" />
</FormControl>
```

## フィードバック

### Alert

```tsx
import { Alert } from '@k8o/arte-odyssey/alert';

<Alert status="info" | "success" | "warning" | "error">
  メッセージ
</Alert>
```

### Toast

```tsx
import { useToast } from '@k8o/arte-odyssey/toast';

const toast = useToast();
toast.show({ message: '保存しました', status: 'success' });
```

### Progress

```tsx
import { Progress } from '@k8o/arte-odyssey/progress';

<Progress value={50} max={100} />
```

### BaselineStatus

Web API のブラウザサポート状況を表示。

```tsx
import { BaselineStatus } from '@k8o/arte-odyssey/baseline-status';

<BaselineStatus featureId="dialog" />
```

## オーバーレイ

### Dialog

```tsx
import { Dialog } from '@k8o/arte-odyssey/dialog';

<Dialog open={open} onClose={onClose} title="確認">
  コンテンツ
</Dialog>
```

### Drawer

```tsx
import { Drawer } from '@k8o/arte-odyssey/drawer';

<Drawer open={open} onClose={onClose} position="right">
  コンテンツ
</Drawer>
```

### Modal

```tsx
import { Modal } from '@k8o/arte-odyssey/modal';

<Modal open={open} onClose={onClose}>
  コンテンツ
</Modal>
```

### Popover

```tsx
import { Popover } from '@k8o/arte-odyssey/popover';

<Popover trigger={<Button>開く</Button>}>
  ポップオーバーコンテンツ
</Popover>
```

### Tooltip

```tsx
import { Tooltip } from '@k8o/arte-odyssey/tooltip';

<Tooltip content="ヒント">
  <Button>ホバー</Button>
</Tooltip>
```

### DropdownMenu

```tsx
import { DropdownMenu, DropdownMenuItem } from '@k8o/arte-odyssey/dropdown-menu';

<DropdownMenu trigger={<Button>メニュー</Button>}>
  <DropdownMenuItem onClick={handleClick}>アイテム1</DropdownMenuItem>
  <DropdownMenuItem>アイテム2</DropdownMenuItem>
</DropdownMenu>
```

## データ表示

### Code

```tsx
import { Code } from '@k8o/arte-odyssey/code';

<Code language="typescript">
  {`const x = 1;`}
</Code>
```

### Heading

```tsx
import { Heading } from '@k8o/arte-odyssey/heading';

<Heading level={1}>見出し</Heading>
```

### TextTag

```tsx
import { TextTag } from '@k8o/arte-odyssey/text-tag';

<TextTag>タグ</TextTag>
```

### ListBox

```tsx
import { ListBox, ListBoxItem } from '@k8o/arte-odyssey/list-box';

<ListBox>
  <ListBoxItem>アイテム1</ListBoxItem>
  <ListBoxItem>アイテム2</ListBoxItem>
</ListBox>
```

## ユーティリティ

### ErrorBoundary

```tsx
import { ErrorBoundary } from '@k8o/arte-odyssey/error-boundary';

<ErrorBoundary fallback={<div>エラーが発生しました</div>}>
  <App />
</ErrorBoundary>
```

### ArteOdysseyProvider

```tsx
import { ArteOdysseyProvider } from '@k8o/arte-odyssey/providers';

<ArteOdysseyProvider>
  <App />
</ArteOdysseyProvider>
```
