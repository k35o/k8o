import {
  ArteOdyssey,
  Badge,
  Card,
  GitHubIcon,
  Heading,
  IconLink,
  QiitaIcon,
  TwitterIcon,
} from '@k8o/arte-odyssey';
import Image from 'next/image';
import { AppCard } from './_components/app-card';
import { EmailTooltip } from './_components/email-tooltip';
import { ActivityErrorBoundary } from './_components/error-boundary';
import { GitHubContributionGraph } from './_components/github-contribution-graph';
import { RecentBlogs } from './_components/recent-blogs';
import k8o from './_images/k8o.jpg';

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
        <ActivityErrorBoundary
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
        </ActivityErrorBoundary>
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
            description="Webフロントエンドを中心に、日々のことも書いています。"
            link="/blog"
            title="Blog"
          />
          <AppCard
            description="過去の登壇テーマや資料へのリンクをまとめています。"
            link="/talks"
            title="Talks"
          />
          <AppCard
            description="ブログ記事や興味のある技術の試作品を集めています。"
            link="/playgrounds"
            title="Playgrounds"
          />
          <AppCard
            description="dotfilesやskills、自作ツールなどの制作物をまとめています。"
            link="/artifacts"
            title="Artifacts"
          />
          <AppCard
            description="気になっている記事を集めて、あとから探せるようにしています。"
            link="/reading-list"
            title="Readings"
          />
          <AppCard
            description="Web Platform Baselineのステータスを追跡します。"
            link="/baseline"
            title="Baseline"
          />
          <AppCard
            accent={<ArteOdyssey size="xl" />}
            description="k8o.meのデザインシステム。コンポーネントやトークンを確認できます。"
            link="https://arte-odyssey.k8o.me"
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
            title="もじカウント"
          />
          <AppCard
            description="日本語の文章を解析し、誤字脱字や文法ミスを指摘します。"
            link="/japanese-text-fixer"
            title="日本語校正くん"
          />
          <AppCard
            description="テキストやURLからQRコードを生成してダウンロードできます。"
            link="/qr-generator"
            title="QRキット"
          />
          <AppCard
            description="2進数・8進数・10進数・16進数を相互に変換します。"
            link="/base-converter"
            title="基数チェンジャー"
          />
          <AppCard
            description="2色のコントラスト比を計算し、WCAGの基準で評価します。"
            link="/contrast-checker"
            title="コントラストチェッカー"
          />
          <AppCard
            description="HEX・RGB・HSLの色表現を相互に変換します。"
            link="/color-converter"
            title="カラーコード職人"
          />
          <AppCard
            description="border-radiusを視覚的に操作してCSSを生成します。"
            link="/radius-maker"
            title="かどまるラボ"
          />
          <AppCard
            description="テーブル名・カラム・制約を入力してCREATE TABLE文を生成します。"
            link="/sql-table-builder"
            title="SQLテーブルメーカー"
          />
          <AppCard
            description="2つのテキストを文字単位で比較して差分を表示します。"
            link="/text-diff"
            title="テキスト差分チェッカー"
          />
        </div>
      </div>
    </div>
  );
}
