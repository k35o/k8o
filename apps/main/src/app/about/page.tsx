import { Anchor, Heading } from '@k8o/arte-odyssey';

export default function Page() {
  return (
    <>
      <section className="flex flex-col gap-3">
        <Heading level="h3">k8oについて</Heading>
        <p className="leading-relaxed">
          Webフロントエンドを軸足に活動しているソフトウェアエンジニアです。TypeScriptとWeb標準が好きで、新しくブラウザで使えるようになった機能を試し、深掘りした結果をブログに残しています。解説には実際に動くデモを添えることを大切にしています。デザインとフロントエンドの境界にも興味があり、デザインシステム
          <Anchor
            href="https://www.npmjs.com/package/@k8o/arte-odyssey"
            openInNewTab
          >
            ArteOdyssey
          </Anchor>
          の構築を通じてその交差点を探っています。
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <Heading level="h3">このサイトについて</Heading>
        <p className="leading-relaxed">
          k8o.meは、k8oの活動と制作物をまとめた個人サイトです。Webフロントエンドを中心とした
          <Anchor href="/blog">ブログ</Anchor>
          、過去の<Anchor href="/talks">登壇資料へのリンク</Anchor>
          、色変換やコントラスト比計算などの開発者向けツール、ブログ記事に関連する試作品を集めた
          <Anchor href="/playgrounds">Playgrounds</Anchor>
          を公開しています。
        </p>
        <p className="leading-relaxed">
          このサイト自体もNext.js（App
          Router）によるTurborepoモノレポとして開発しており、ソースコードは
          <Anchor href="https://github.com/k35o/k8o" openInNewTab>
            GitHub
          </Anchor>
          で公開しています。デザインはArteOdysseyのコンポーネントとセマンティックトークンで統一しています。
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <Heading level="h3">発信している場所</Heading>
        <p className="leading-relaxed">
          技術記事はこのサイトの<Anchor href="/blog">ブログ</Anchor>
          に書き、日々の気づきは
          <Anchor href="https://x.com/k8ome" openInNewTab>
            X
          </Anchor>
          で発信しています。開発の活動は
          <Anchor href="https://github.com/k35o" openInNewTab>
            GitHub
          </Anchor>
          にまとまっています。連絡手段は
          <Anchor href="/contact">Contact</Anchor>
          を参照してください。
        </p>
      </section>
    </>
  );
}
