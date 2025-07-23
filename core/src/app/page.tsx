import { AppCard } from './_components/app-card';
import { EmailTooltip } from './_components/email-tooltip';
import arteodyssey from './_images/arteodyssey.png';
import k8o from './_images/k8o.jpg';
import { RoundedIcon } from './radius-maker/_components/rounded-icon';
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

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <Card>
        <div className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
            <Image
              className="size-24 rounded-md sm:size-32"
              src={k8o}
              width={128}
              height={128}
              alt="k8oのアイコン"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <Heading type="h3">k8o</Heading>
                <div className="flex flex-wrap items-center gap-2">
                  <EmailTooltip />
                  <IconLink
                    href="https://x.com/k8ome"
                    label="Xのアカウント"
                  >
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
                <TextTag text="フロントエンド" size="sm" />
                <TextTag text="TypeScript" size="sm" />
                <TextTag text="デザイン" size="sm" />
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
            link="/blog"
            symbol="📕"
            title="Blog"
            description="k8oのブログです。ジャンルを問わず、身の回りのことを書きます。"
          />
          <AppCard
            link="/talks"
            symbol="🎙️"
            title="Talks"
            description="過去の登壇内容をまとめたページです。講演のテーマや資料へのリンクを掲載しています。"
          />
          <AppCard
            link="/playgrounds"
            symbol="👾"
            title="Playgrounds"
            description="Blogのために作成したサンプルや趣味で作成した試作品を集めました。"
          />
          <AppCard
            link="/design-system"
            symbol={
              <Image
                src={arteodyssey}
                alt=""
                className="size-16"
                loading="eager"
              />
            }
            title="ArteOdyssey"
            description="k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。"
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
            link="/moji-count"
            symbol="📏"
            title="もじカウント"
            description="テキストの文字数を数えます。ひらがな・カタカナ・漢字・アルファベット・記号・絵文字など、文字の種類を問わず数えられます。"
          />
          <AppCard
            link="/japanese-text-fixer"
            symbol="🧐"
            title="日本語校正くん"
            description="日本語で書かれた文章の誤字や脱字、文法ミス、表現の改善ポイントをチェックします。"
          />
          <AppCard
            link="/qr-generator"
            symbol="📱"
            title="QRKit"
            description="任意のテキストやURLからQRコードを生成できるツールです。"
          />
          <AppCard
            link="/base-converter"
            symbol="🧬"
            title="基数チェンジャー"
            description="2進数・8進数・10進数・16進数を相互に変換します。"
          />
          <AppCard
            link="/contrast-checker"
            symbol="⚖️"
            title="コントラストチェッカー"
            description="選択した2つの色からコントラスト比を計算します。WCAGが定める基準から色の組み合わせの妥当性を確認できます。"
          />
          <AppCard
            link="/color-converter"
            symbol="🎨"
            title="カラーコード職人"
            description="RGBとHEXのように、特定の色の異なる表現を確認します。"
          />
          <AppCard
            link="/radius-maker"
            symbol={<RoundedIcon />}
            title="かどまるラボ"
            description="角丸を変化させてお気に入りの図形を探しましょう"
          />
          <AppCard
            link="/sql-table-builder"
            symbol="🔨"
            title="SQLテーブルメーカー"
            description="データベースのテーブルを作成するSQL文を発行します。"
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
