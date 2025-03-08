import { Heading } from '../components/heading';
import { AppCard } from './_components/app-card';
import { EmailTooltip } from './_components/email-tooltip';
import k8o from './_images/k8o.jpg';
import { RoundedIcon } from './radius-maker/_components/rounded-icon';
import { Card } from '@/components/card';
import { IconLink } from '@/components/icon-link';
import {
  ArteOdyssey,
  GithubMark,
  Qiita,
  Zenn,
} from '@/components/icons';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <Card>
        <div className="flex gap-6 p-4">
          <Image
            className="size-32 rounded-md"
            src={k8o}
            width={128}
            height={128}
            alt="k8oのアイコン"
          />
          <div className="flex h-32 w-full flex-col justify-around">
            <div className="flex h-full flex-col justify-evenly md:h-auto md:flex-row md:items-center md:justify-between">
              <Heading type="h3">k8o</Heading>
              <div className="flex items-center justify-end gap-1">
                <EmailTooltip />
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
              <p className="text-md line-clamp-1">
                WebフロントとTypeScriptに興味があります。
              </p>
              <p className="text-md line-clamp-2">
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
            link="/design-system"
            symbol={
              <ArteOdyssey className="text-primary-fg size-16" />
            }
            title="ArteOdyssey"
            description="k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。"
          />
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
