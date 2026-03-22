import {
  ArteOdyssey,
  Badge,
  Card,
  ErrorBoundary,
  GitHubIcon,
  Heading,
  IconLink,
  QiitaIcon,
  TwitterIcon,
} from '@k8o/arte-odyssey';
import Image from 'next/image';
import { AppCard } from './_components/app-card';
import { EmailTooltip } from './_components/email-tooltip';
import { GitHubContributionGraph } from './_components/github-contribution-graph';
import { RecentBlogs } from './_components/recent-blogs';
import k8o from './_images/k8o.jpg';
import { RoundedIcon } from './radius-maker/_components/rounded-icon';

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <Card>
        <div className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
            <Image
              alt="k8oのアイコン"
              className="size-24 rounded-md sm:size-32"
              height={128}
              src={k8o}
              width={128}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <Heading type="h3">k8o</Heading>
                <div className="flex flex-wrap items-center gap-2">
                  <EmailTooltip />
                  <IconLink href="https://x.com/k8ome" label="Xのアカウント">
                    <TwitterIcon />
                  </IconLink>
                  <IconLink
                    href="https://github.com/k35o"
                    label="GitHubのアカウント"
                  >
                    <GitHubIcon />
                  </IconLink>
                  <IconLink
                    href="https://qiita.com/k8o"
                    label="Qiitaのアカウント"
                  >
                    <QiitaIcon />
                  </IconLink>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge size="sm" text="フロントエンド" />
                <Badge size="sm" text="TypeScript" />
                <Badge size="sm" text="デザイン" />
              </div>

              <p className="text-fg-mute text-sm leading-relaxed">
                WebフロントエンドとTypeScriptが好きで、Baselineを追いながらWeb標準の進化を楽しんでいます。
                デザインシステムの構築を通じて、デザインとフロントエンドの交差点を探っています。
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <div>
          <Heading type="h2">Activity</Heading>
        </div>
        <ErrorBoundary
          fallback={
            <div className="grid gap-8">
              <RecentBlogs />
            </div>
          }
        >
          <div className="grid items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:sticky lg:top-4">
              <GitHubContributionGraph />
            </div>
            <div className="md:col-span-2">
              <RecentBlogs />
            </div>
          </div>
        </ErrorBoundary>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <Heading type="h2">Forge</Heading>
          <p className="text-fg-mute text-sm">
            考えたことや作ったものを形にして公開する場。
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AppCard
            description="Webフロントエンドの話題を中心に、日々のことも書くブログ。"
            link="/blog"
            symbol="📕"
            title="Blog"
          />
          <AppCard
            description="過去の登壇内容をまとめたページです。講演のテーマや資料へのリンクを掲載しています。"
            link="/talks"
            symbol="🎙️"
            title="Talks"
          />
          <AppCard
            description="ブログの記事や興味のある技術を試した試作品を集めた場所。"
            link="/playgrounds"
            symbol="👾"
            title="Playgrounds"
          />
          <AppCard
            description="公開しているオープンソースプロジェクトをまとめたページです。"
            link="/oss"
            symbol="📦"
            title="OSS"
          />
          <AppCard
            description="普段読んでいる記事をまとめたページ。"
            link="/reading-list"
            symbol="📖"
            title="よんでるもの"
          />
          <AppCard
            description="k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。"
            link="https://arte-odyssey.k8o.me"
            symbol={<ArteOdyssey size="lg" />}
            title="ArteOdyssey"
          />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <Heading type="h2">Assist</Heading>
          <p className="text-fg-mute text-sm">
            日々の作業や日常で役立つちょっとしたツール群。
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AppCard
            description="テキストの文字数をリアルタイムに数えます。"
            link="/moji-count"
            symbol="📏"
            title="もじカウント"
          />
          <AppCard
            description="日本語の文章を解析し、誤字脱字や文法ミスを指摘します。"
            link="/japanese-text-fixer"
            symbol="🧐"
            title="日本語校正くん"
          />
          <AppCard
            description="テキストやURLからQRコードを生成してダウンロードできます。"
            link="/qr-generator"
            symbol="📱"
            title="QRキット"
          />
          <AppCard
            description="2進数・8進数・10進数・16進数を相互に変換します。"
            link="/base-converter"
            symbol="🧬"
            title="基数チェンジャー"
          />
          <AppCard
            description="2色のコントラスト比を計算し、WCAGの基準で評価します。"
            link="/contrast-checker"
            symbol="⚖️"
            title="コントラストチェッカー"
          />
          <AppCard
            description="HEX・RGB・HSLの色表現を相互に変換します。"
            link="/color-converter"
            symbol="🎨"
            title="カラーコード職人"
          />
          <AppCard
            description="border-radiusを視覚的に操作してCSSを生成します。"
            link="/radius-maker"
            symbol={<RoundedIcon />}
            title="かどまるラボ"
          />
          <AppCard
            description="テーブル名・カラム・制約を入力してCREATE TABLE文を生成します。"
            link="/sql-table-builder"
            symbol="🔨"
            title="SQLテーブルメーカー"
          />
          <AppCard
            description="2つのテキストを文字単位で比較して差分を表示します。"
            link="/text-diff"
            symbol="🔍"
            title="テキスト差分チェッカー"
          />
        </div>
      </div>
    </div>
  );
}
