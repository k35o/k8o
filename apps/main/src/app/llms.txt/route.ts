import { NextResponse } from 'next/server';
import { getBlogContents } from '@/app/blog/_api';

async function _generateLlmContent() {
  'use cache';

  const blogs = await getBlogContents();

  const blogContent = (
    await Promise.all(
      blogs.map((blog) => {
        if (!blog.description) {
          return `#### ${blog.title}`;
        }
        return `
#### ${blog.title}
${blog.description}
    `;
      }),
    )
  ).join('\n');

  return `
# k8o
WebフロントエンドとTypeScriptが好きで、Baselineを追いながらWeb標準の進化を楽しんでいます。
デザインシステムの構築を通じて、デザインとフロントエンドの交差点を探っています。

## Forge
考えたことや作ったものを形にして公開する場。

### Blog
Webフロントエンドの話題を中心に、日々のことも書くブログ。

${blogContent}

### Talks
過去の登壇内容をまとめたページです。講演のテーマや資料へのリンクを掲載しています。

### ArteOdyssey
k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。

## Assist
日々の作業や日常で役立つちょっとしたツール群。

### もじカウント
テキストの文字数をリアルタイムに数えます。

### 日本語校正くん
日本語の文章を解析し、誤字脱字や文法ミスを指摘します。

### QRキット
テキストやURLからQRコードを生成してダウンロードできます。

### 基数チェンジャー
2進数・8進数・10進数・16進数を相互に変換します。

### コントラストチェッカー
2色のコントラスト比を計算し、WCAGの基準で評価します。

### カラーコード職人
HEX・RGB・HSLの色表現を相互に変換します。

### かどまるラボ
border-radiusを視覚的に操作してCSSを生成します。

### SQLテーブルメーカー
テーブル名・カラム・制約を入力してCREATE TABLE文を生成します。

### Quizzes
いろいろなジャンルの知識をクイズで試せます。

### テキスト差分チェッカー
2つのテキストを文字単位で比較して差分を表示します。
  `;
}

export async function GET() {
  const content = await _generateLlmContent();

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
