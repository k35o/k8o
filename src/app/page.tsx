import { Heading } from '../components/heading';
import k8o from './_images/k8o.jpg';
import Image from 'next/image';
import { IconLink } from '@/components/icon-link';
import { GithubMark, Qiita, Zenn } from '@/components/icons';
import { Card } from '@/components/card';
import { AppCard } from './_components/app-card';

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <Card>
        <div className="flex gap-6 p-4">
          <Image
            className="size-32 rounded-lg"
            src={k8o}
            width={128}
            height={128}
            alt="k8oのアイコン"
          />
          <div className="flex h-32 w-full flex-col justify-around">
            <div className="flex h-full flex-col justify-evenly md:h-auto md:flex-row md:items-center md:justify-between">
              <Heading type="h3">k8o</Heading>
              <div className="flex items-center justify-end gap-1">
                <IconLink href="https://github.com/k35o">
                  <GithubMark
                    title="GitHubのアカウント"
                    className="size-5 md:size-6"
                  />
                </IconLink>
                <IconLink href="https://qiita.com/KokiSakano">
                  <Qiita
                    title="Qiitaのアカウント"
                    className="size-5 md:size-6"
                  />
                </IconLink>
                <IconLink href="https://zenn.dev/kokisakano">
                  <Zenn
                    title="Zennのアカウント"
                    className="size-5 md:size-6"
                  />
                </IconLink>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="line-clamp-1 text-base">
                WebフロントとTypeScriptに興味があります。
              </p>
              <p className="line-clamp-2 text-base">
                このサイトは日常で欲したアプリケーションやブログを公開しています。
              </p>
            </div>
          </div>
        </div>
      </Card>
      <div className="flex flex-col gap-6">
        <Heading type="h2">アプリケーション</Heading>
        <div className="grid gap-8 md:grid-cols-2">
          <AppCard
            link="/blog"
            symbol="📕"
            title="Blog"
            description="k8oのブログです。ジャンルを問わず、身の回りのことを書きます。"
          />
          <AppCard
            link="/moji-count"
            symbol="📏"
            title="もじカウント"
            description="テキストの文字数を簡単かつ正確にカウントできるシンプルなツールです。日本語、英語、記号、絵文字、テキストの種類を問わず分析できます。"
          />
          <AppCard
            link="/japanese-text-fixer"
            symbol="🧐"
            title="日本語校正くん"
            description="日本語文章の誤字脱字、文法ミス、表現の改善ポイントを簡単にチェックできるツールです。"
          />
          <AppCard
            link="/base-converter"
            symbol="🧬"
            title="基数チェンジャー"
            description="整数を簡単に異なる進数表現に変換するツールです。"
          />
          <AppCard
            link="/contrast-checker"
            symbol="⚖️"
            title="コントラストチェッカー"
            description="2つの色のコントラスト比を計算し、アクセシビリティ基準を満たしているか確認するツールです。"
          />
          <AppCard
            link="/color-converter"
            symbol="🎨"
            title="カラーコード職人"
            description="色の表現方法を自由に変換できるツールです。"
          />
          <AppCard
            link="/radius-maker"
            symbol="🧑‍🎨"
            title="かどまるラボ"
            description="角丸を決めてお気に入りの図形を探しましょう"
          />
          <AppCard
            link="/sql-table-builder"
            symbol="🧑‍💻"
            title="SQLテーブルメーカー"
            description="データベーステーブルの作成用SQL分を簡単に生成するツールです。"
          />
          <AppCard
            link="/quizzes"
            symbol="💡"
            title="Quizzes"
            description="色々なジャンルのクイズを出します"
          />
        </div>
      </div>
    </div>
  );
}
