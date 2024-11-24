import { Heading } from '../components/heading';
import k8o from './_images/k8o.jpg';
import Image from 'next/image';
import { IconLink } from '@/components/icon-link';
import { GithubMark, Qiita, Zenn } from '@/components/icons';
import { ShowCase } from './_components/showcase';
import { Card } from '@/components/card';

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
        <ShowCase.Container>
          <ShowCase.Item link="/blog" emotion="📕" title="Blog" />
          <ShowCase.Item
            link="/moji-count"
            emotion="📏"
            title="もじカウント"
          />
          <ShowCase.Item
            link="/japanese-text-fixer"
            emotion="🧐"
            title="日本語校正くん"
          />
          <ShowCase.Item
            link="/base-converter"
            emotion="🧬"
            title="基数チェンジャー"
          />
          <ShowCase.Item
            link="/contrast-checker"
            emotion="⚖️"
            title="コントラストチェッカー"
          />
          <ShowCase.Item
            link="/color-converter"
            emotion="🎨"
            title="カラーコード職人"
          />
          <ShowCase.Item
            link="/radius-maker"
            emotion="🧑‍🎨"
            title="かどまるラボ"
          />
          <ShowCase.Item
            link="/sql-table-builder"
            emotion="🧑‍💻"
            title="SQLテーブルメーカー"
          />
          <ShowCase.Item
            link="/quizzes"
            emotion="💡"
            title="Quizzes"
          />
        </ShowCase.Container>
      </div>
    </div>
  );
}
