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
WebフロントエンドとTypeScriptに興味があり、特にフロントエンドとデザインの境界に関心があります。
現在、デザインを中心に学びながら、別の角度からフロントエンドの理解を深めています。

## Forge
ブログ、デザインなど、思考やアイデアを形にする場。発想を練り、磨きながら創造を深めていきます。

### Blog
k8oのブログです。ジャンルを問わず、身の回りのことを書きます。

${blogContent}

### Talks
過去の登壇内容をまとめたページです。講演のテーマや資料へのリンクを掲載しています。

### ArteOdyssey
k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。

## Assist
制作をサポートするツール群。創作をスムーズに進めるための実用的な機能を提供します。

### もじカウント
テキストの文字数を数えます。

### 日本語校正くん
日本語で書かれた文章の誤字や脱字、文法ミス、表現の改善ポイントをチェックします。

### 基数チェンジャー
2進数・8進数・10進数・16進数を相互に変換します。

### コントラストチェッカー
選択した2つの色からコントラスト比を計算します。

### カラーコード職人
RGBとHEXのように、特定の色の異なる表現を確認します。

### かどまるラボ
角丸を変化させてお気に入りの図形を探しましょう。

### SQLテーブルメーカー
データベースのテーブルを作成するSQL文を発行します。

### Quizzes
色々なジャンルのクイズを出します。
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
