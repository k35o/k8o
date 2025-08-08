import { Card } from '@k8o/arte-odyssey/card';
import { Heading } from '@k8o/arte-odyssey/heading';
import { IconLink } from '@k8o/arte-odyssey/icon-link';
import {
  GitHubIcon,
  QiitaIcon,
  TwitterIcon,
  ZennIcon,
} from '@k8o/arte-odyssey/icons';
import { TextTag } from '@k8o/arte-odyssey/text-tag';
import Image from 'next/image';
import { AppCard } from './_components/app-card';
import { EmailTooltip } from './_components/email-tooltip';
import arteodyssey from './_images/arteodyssey.png';
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
                  <IconLink
                    href="https://zenn.dev/kokisakano"
                    label="Zennのアカウント"
                  >
                    <ZennIcon />
                  </IconLink>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <TextTag size="sm" text="フロントエンド" />
                <TextTag size="sm" text="TypeScript" />
                <TextTag size="sm" text="デザイン" />
              </div>

              <p className="text-fg-mute text-sm leading-relaxed">
                WebフロントエンドとTypeScriptに興味があり、特にフロントエンドとデザインの境界に関心があります。
                現在、デザインを中心に学びながら、別の角度からフロントエンドを探求しています。
              </p>
            </div>
          </div>
        </div>
      </Card>
      <div className="flex flex-col gap-6">
        <div>
          <Heading type="h2">Forge</Heading>
          <p className="text-fg-mute text-sm">
            ブログ、デザインなど、思考やアイデアを形にする場。発想を練り、磨きながら創造を深めていきます。
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AppCard
            description="k8oのブログです。ジャンルを問わず、身の回りのことを書きます。"
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
            description="Blogのために作成したサンプルや趣味で作成した試作品を集めました。"
            link="/playgrounds"
            symbol="👾"
            title="Playgrounds"
          />
          <AppCard
            description="k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。"
            link="/design-system"
            symbol={
              <Image
                alt=""
                className="size-16"
                loading="eager"
                src={arteodyssey}
              />
            }
            title="ArteOdyssey"
          />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <Heading type="h2">Assist</Heading>
          <p className="text-fg-mute text-sm">
            制作をサポートするツール群。創作をスムーズに進めるための実用的な機能を提供します。
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AppCard
            description="テキストの文字数を数えます。ひらがな・カタカナ・漢字・アルファベット・記号・絵文字など、文字の種類を問わず数えられます。"
            link="/moji-count"
            symbol="📏"
            title="もじカウント"
          />
          <AppCard
            description="日本語で書かれた文章の誤字や脱字、文法ミス、表現の改善ポイントをチェックします。"
            link="/japanese-text-fixer"
            symbol="🧐"
            title="日本語校正くん"
          />
          <AppCard
            description="任意のテキストやURLからQRコードを生成できるツールです。"
            link="/qr-generator"
            symbol="📱"
            title="QRKit"
          />
          <AppCard
            description="2進数・8進数・10進数・16進数を相互に変換します。"
            link="/base-converter"
            symbol="🧬"
            title="基数チェンジャー"
          />
          <AppCard
            description="選択した2つの色からコントラスト比を計算します。WCAGが定める基準から色の組み合わせの妥当性を確認できます。"
            link="/contrast-checker"
            symbol="⚖️"
            title="コントラストチェッカー"
          />
          <AppCard
            description="RGBとHEXのように、特定の色の異なる表現を確認します。"
            link="/color-converter"
            symbol="🎨"
            title="カラーコード職人"
          />
          <AppCard
            description="角丸を変化させてお気に入りの図形を探しましょう"
            link="/radius-maker"
            symbol={<RoundedIcon />}
            title="かどまるラボ"
          />
          <AppCard
            description="データベースのテーブルを作成するSQL文を発行します。"
            link="/sql-table-builder"
            symbol="🔨"
            title="SQLテーブルメーカー"
          />
          <AppCard
            description="色々なジャンルのクイズを出します"
            link="/quizzes"
            symbol="💡"
            title="Quizzes"
          />
        </div>
      </div>
    </div>
  );
}
