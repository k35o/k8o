# ArteOdyssey コンポーネント一覧

## インポート方法

```tsx
// スタイルシート（必須）
import '@k8o/arte-odyssey/styles.css';

// プロバイダー（アプリルートで1回）
import { ArteOdysseyProvider } from '@k8o/arte-odyssey';

// 各コンポーネント（個別インポート）
import { Button } from '@k8o/arte-odyssey';
import { Card } from '@k8o/arte-odyssey';
```

## レイアウト・ナビゲーション

### Accordion

折りたたみ可能なセクション。

```tsx
import { Accordion, AccordionItem } from '@k8o/arte-odyssey';

<Accordion>
  <AccordionItem title="セクション1">
    コンテンツ
  </AccordionItem>
</Accordion>
```

### Breadcrumb

パンくずリスト。

```tsx
import { Breadcrumb, BreadcrumbItem } from '@k8o/arte-odyssey';

<Breadcrumb>
  <BreadcrumbItem href="/">ホーム</BreadcrumbItem>
  <BreadcrumbItem href="/products">製品</BreadcrumbItem>
  <BreadcrumbItem>詳細</BreadcrumbItem>
</Breadcrumb>
```

### Card / InteractiveCard

コンテンツをグループ化するカード。

```tsx
import { Card, InteractiveCard } from '@k8o/arte-odyssey';

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
import { Tabs, TabList, Tab, TabPanel } from '@k8o/arte-odyssey';

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
import { Separator } from '@k8o/arte-odyssey';

<Separator />
<Separator color="mute" />
<Separator color="subtle" />
<Separator orientation="vertical" />
```

### ScrollLinked

スクロール進捗をプログレスバーで表示。

```tsx
import { ScrollLinked } from '@k8o/arte-odyssey';

<ScrollLinked />
<ScrollLinked container={containerRef} />
```

## ボタン・リンク

### Button

```tsx
import { Button } from '@k8o/arte-odyssey';

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
import { IconButton } from '@k8o/arte-odyssey';

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
import { LinkButton } from '@k8o/arte-odyssey';

<LinkButton href="/page" color="gray" variant="outlined">リンク</LinkButton>
```

### IconLink

アイコンのみのリンク。IconButton と同じ `bg` prop。

```tsx
import { IconLink } from '@k8o/arte-odyssey';

<IconLink href="/home" bg="base" label="ホーム">
  <HomeIcon />
</IconLink>
```

### Anchor

テキストリンク。

```tsx
import { Anchor } from '@k8o/arte-odyssey';

<Anchor href="https://example.com" isExternal>
  外部リンク
</Anchor>
```

## フォーム

### TextField

```tsx
import { TextField } from '@k8o/arte-odyssey';

<TextField id="email" defaultValue="" placeholder="example@mail.com" />
```

### Textarea

```tsx
import { Textarea } from '@k8o/arte-odyssey';

<Textarea label="説明" rows={4} value={value} onChange={onChange} />
```

### Checkbox

```tsx
import { Checkbox } from '@k8o/arte-odyssey';

<Checkbox checked={checked} onChange={onChange}>同意する</Checkbox>
```

### Radio

```tsx
import { Radio } from '@k8o/arte-odyssey';

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
import { Select } from '@k8o/arte-odyssey';

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
import { NumberField } from '@k8o/arte-odyssey';

<NumberField label="数量" min={0} max={100} value={value} onChange={onChange} />
```

### Slider

```tsx
import { Slider } from '@k8o/arte-odyssey';

<Slider label="音量" min={0} max={100} value={value} onChange={onChange} />
```

### Autocomplete

```tsx
import { Autocomplete } from '@k8o/arte-odyssey';

<Autocomplete label="検索" options={options} value={value} onChange={onChange} />
```

### FileField

コンポジットパターンのファイルアップロード。

```tsx
import { FileField } from '@k8o/arte-odyssey';

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
import { FormControl } from '@k8o/arte-odyssey';

<FormControl label="ラベル" error="エラーメッセージ" isRequired>
  <TextField id="name" />
</FormControl>
```

## フィードバック

### Alert

```tsx
import { Alert } from '@k8o/arte-odyssey';

<Alert status="info" | "success" | "warning" | "error">
  メッセージ
</Alert>
```

### Toast

```tsx
import { useToast } from '@k8o/arte-odyssey';

const toast = useToast();
toast.show({ message: '保存しました', status: 'success' });
```

### Progress

```tsx
import { Progress } from '@k8o/arte-odyssey';

<Progress value={50} max={100} />
```

### BaselineStatus

Web API のブラウザサポート状況を表示。

```tsx
import { BaselineStatus } from '@k8o/arte-odyssey';

<BaselineStatus featureId="dialog" />
```

## オーバーレイ

### Dialog

```tsx
import { Dialog } from '@k8o/arte-odyssey';

<Dialog open={open} onClose={onClose} title="確認">
  コンテンツ
</Dialog>
```

### Drawer

```tsx
import { Drawer } from '@k8o/arte-odyssey';

<Drawer open={open} onClose={onClose} position="right">
  コンテンツ
</Drawer>
```

### Modal

```tsx
import { Modal } from '@k8o/arte-odyssey';

<Modal open={open} onClose={onClose}>
  コンテンツ
</Modal>
```

### Popover

```tsx
import { Popover } from '@k8o/arte-odyssey';

<Popover trigger={<Button>開く</Button>}>
  ポップオーバーコンテンツ
</Popover>
```

### Tooltip

```tsx
import { Tooltip } from '@k8o/arte-odyssey';

<Tooltip content="ヒント">
  <Button>ホバー</Button>
</Tooltip>
```

### DropdownMenu

```tsx
import { DropdownMenu, DropdownMenuItem } from '@k8o/arte-odyssey';

<DropdownMenu trigger={<Button>メニュー</Button>}>
  <DropdownMenuItem onClick={handleClick}>アイテム1</DropdownMenuItem>
  <DropdownMenuItem>アイテム2</DropdownMenuItem>
</DropdownMenu>
```

## データ表示

### Code

```tsx
import { Code } from '@k8o/arte-odyssey';

<Code language="typescript">
  {`const x = 1;`}
</Code>
```

### Heading

```tsx
import { Heading } from '@k8o/arte-odyssey';

<Heading level={1}>見出し</Heading>
```

### Badge

```tsx
import { Badge } from '@k8o/arte-odyssey';

<Badge>タグ</Badge>
```

### ListBox

```tsx
import { ListBox, ListBoxItem } from '@k8o/arte-odyssey';

<ListBox>
  <ListBoxItem>アイテム1</ListBoxItem>
  <ListBoxItem>アイテム2</ListBoxItem>
</ListBox>
```

## ユーティリティ

### ErrorBoundary

```tsx
import { ErrorBoundary } from '@k8o/arte-odyssey';

<ErrorBoundary fallback={<div>エラーが発生しました</div>}>
  <App />
</ErrorBoundary>
```

### ArteOdysseyProvider

```tsx
import { ArteOdysseyProvider } from '@k8o/arte-odyssey';

<ArteOdysseyProvider>
  <App />
</ArteOdysseyProvider>
```
