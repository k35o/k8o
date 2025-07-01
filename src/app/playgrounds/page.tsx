'use client';

import {
  Playground,
  ClipboardTextDemo,
  ClipboardImageDemo,
  PopoverApiDemo,
  TooltipDropdownDemo,
  DialogRequestCloseDemo,
  PrintColorAdjustDemo,
  WakeLockDemo,
  SuspenseListDemo,
  CssMathFunctionsDemo,
  HighlightBasicDemo,
  HighlightPriorityDemo,
  HighlightSpellingDemo,
  SpellingGrammarErrorDemo,
} from '@/app/_components/playgrounds';
import { Anchor } from '@/components/anchor';
import { Card } from '@/components/card';
import { Heading } from '@/components/heading';
import { Separator } from '@/components/separator';
import { TextTag } from '@/components/text-tag';

const playgroundSections = [
  {
    id: 'async-clipboard',
    title: 'Clipboard API',
    description:
      'ブラウザのクリップボードに任意のデータをコピー・ペーストできるAPIです。',
    category: 'Web API',
    slug: 'async-clipboard',
    demos: [
      {
        component: ClipboardTextDemo,
        title: 'テキストのコピー・ペースト',
      },
      {
        component: ClipboardImageDemo,
        title: '画像のコピー・ペースト',
      },
    ],
  },
  {
    id: 'popover',
    title: 'Popover API',
    description:
      'JavaScriptなしでツールチップやドロップダウンメニューを実装できるAPIです。',
    category: 'Web API',
    slug: 'popover',
    demos: [
      { component: PopoverApiDemo, title: '基本的なポップオーバー' },
      {
        component: TooltipDropdownDemo,
        title: 'ツールチップ・ドロップダウン',
      },
    ],
  },
  {
    id: 'requestclose',
    title: 'Dialog requestClose',
    description:
      'ダイアログのrequestCloseイベントでESCキーやクリック以外の閉じる動作を検知できます。',
    category: 'Web API',
    slug: 'requestclose',
    demos: [
      {
        component: DialogRequestCloseDemo,
        title: 'ダイアログの閉じる動作検知',
      },
    ],
  },
  {
    id: 'print-color-adjust',
    title: 'CSS print-color-adjust',
    description: '印刷時の色の調整を制御するCSSプロパティです。',
    category: 'CSS',
    slug: 'print-color-adjust',
    demos: [
      {
        component: PrintColorAdjustDemo,
        title: '印刷時の色調整デモ',
      },
    ],
  },
  {
    id: 'screen-wake-lock',
    title: 'Screen Wake Lock API',
    description:
      'デバイスのスクリーンが自動的にスリープ状態になることを防ぐAPIです。',
    category: 'Web API',
    slug: 'screen-wake-lock',
    demos: [
      { component: WakeLockDemo, title: 'スクリーンスリープ防止' },
    ],
  },
  {
    id: 'suspense-list',
    title: 'React SuspenseList',
    description:
      '複数のSuspenseコンポーネントの表示順序や読み込みタイミングを制御します。',
    category: 'React',
    slug: 'suspense-list',
    demos: [
      {
        component: SuspenseListDemo,
        title: 'SuspenseListによる読み込み制御',
      },
    ],
  },
  {
    id: 'abs-sign',
    title: 'CSS abs()とsign()関数',
    description: '数値の絶対値と符号を取得するCSS関数です。',
    category: 'CSS',
    slug: 'abs-sign',
    demos: [
      { component: CssMathFunctionsDemo, title: 'CSS数学関数デモ' },
    ],
  },
  {
    id: 'highlight',
    title: 'CSS Custom Highlight API',
    description:
      'DOMを変更せずに任意のテキスト範囲をハイライトできるAPIです。',
    category: 'CSS',
    slug: 'highlight',
    demos: [
      { component: HighlightBasicDemo, title: '基本的なハイライト' },
      {
        component: HighlightPriorityDemo,
        title: '優先度ベースハイライト',
      },
      {
        component: HighlightSpellingDemo,
        title: 'スペリング・文法エラーハイライト',
      },
    ],
  },
  {
    id: 'spelling-grammar-error',
    title: 'CSS spelling-error & grammar-error',
    description:
      'ブラウザが検出したスペルミスや文法エラーのスタイリングを制御します。',
    category: 'CSS',
    slug: 'spelling-grammar-error',
    demos: [
      {
        component: SpellingGrammarErrorDemo,
        title: 'スペル・文法エラースタイリング',
      },
    ],
  },
];

export default function PlaygroundsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Heading type="h1">Playgrounds</Heading>
        <p className="text-fg-subtle mt-2">
          インタラクティブなWeb技術のデモ集。最新のWeb
          API、CSS機能、React技術を実際に体験できます。
        </p>
      </div>

      <div className="space-y-12">
        {playgroundSections.map((section, sectionIndex) => (
          <div key={section.id}>
            {sectionIndex > 0 && <Separator />}

            <div className="mb-6">
              <div className="mb-3 flex items-start justify-between gap-4">
                <Heading type="h2">{section.title}</Heading>
                <TextTag text={section.category} size="sm" />
              </div>
              <p className="text-fg-subtle mb-3">
                {section.description}
              </p>
              <Anchor href={`/blog/${section.slug}`}>
                詳細な解説を読む →
              </Anchor>
            </div>

            <div className="space-y-6">
              {section.demos.map((demo, demoIndex) => {
                const DemoComponent = demo.component;
                return (
                  <Card key={demoIndex}>
                    <div className="p-6">
                      <h3 className="text-fg-base mb-4 text-lg font-semibold">
                        {demo.title}
                      </h3>
                      <Playground>
                        <DemoComponent />
                      </Playground>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
