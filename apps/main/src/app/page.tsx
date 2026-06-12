import { ArteOdyssey, Heading, Separator } from '@k8o/arte-odyssey';
import Image from 'next/image';

import { AppCard } from './_components/app-card';
import { EmailTooltip } from './_components/email-tooltip';
import { ActivityErrorBoundary } from './_components/error-boundary';
import { GitHubContributionGraph } from './_components/github-contribution-graph';
import { RecentBlogs } from './_components/recent-blogs';
import { SocialIcons } from './_components/social-icons';
import k8o from './_images/k8o.jpg';

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-12">
        <header className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-5 pt-2 lg:gap-x-10">
          <Image
            alt="k8oのアイコン"
            className="size-16 rounded-full lg:row-span-2 lg:size-32"
            height={128}
            src={k8o}
            width={128}
          />
          <div className="flex flex-col gap-3">
            <Heading type="h1">k8o</Heading>
            <div className="flex flex-wrap items-center gap-2">
              <SocialIcons />
              <EmailTooltip />
            </div>
          </div>

          <p className="text-fg-mute col-span-2 leading-relaxed lg:col-span-1 lg:col-start-2">
            Webフロントエンドを軸足に、最近はBaselineに追加された機能の深掘りをブログに残しています。
            デザインとの境界にも興味があり、デザインシステムArteOdysseyを育てています。
          </p>
        </header>

        <Separator color="subtle" />

        <div className="flex flex-col gap-6">
          <div>
            <Heading type="h2">Activity</Heading>
            <p className="text-fg-mute text-sm">
              最近の発信と、GitHubでの活動の記録。
            </p>
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
              description="絵の具を流して模様を描く、フルイドアートのお絵かきWebアプリです。"
              link="https://fluida.k8o.me"
              title="fluida"
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
              description="Web Platform Baselineのステータスを追跡します。"
              link="/baseline"
              title="Baseline"
            />
            <AppCard
              description="テキストの文字数をリアルタイムに数えます。"
              link="/moji-count"
              title="もじカウント"
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
              description="色からHexコードを当てたり、Hexコードから色を選ぶクイズです。"
              link="/color-quiz"
              title="カラーHexクイズ"
            />
            <AppCard
              description="border-radiusを視覚的に操作してCSSを生成します。"
              link="/radius-maker"
              title="かどまるラボ"
            />
            <AppCard
              description="2つのテキストを文字単位で比較して差分を表示します。"
              link="/text-diff"
              title="テキスト差分チェッカー"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
