import { Anchor, Heading } from '@k8ordo/ui';

export default function Page() {
  return (
    <>
      <p className="leading-relaxed">
        本ページでは、k8oが運営する個人サイトk8o.me（以下、当サイト）における利用者情報の取り扱いを説明します。
      </p>
      <section className="flex flex-col gap-3">
        <Heading level="h3">アクセス解析</Heading>
        <p className="leading-relaxed">
          当サイトは、利用状況の把握とコンテンツ改善のために次のアクセス解析ツールを使用しています。いずれの計測でも、運営者が個人を特定することはありません。
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6 leading-relaxed">
          <li>
            Google
            Analytics：Cookieを使用してアクセス情報を収集します。収集される情報や仕組みは
            <Anchor
              href="https://policies.google.com/technologies/partner-sites"
              openInNewTab
            >
              Googleのポリシーと規約
            </Anchor>
            を参照してください。
          </li>
          <li>
            Vercel AnalyticsおよびSpeed
            Insights：Cookieを使用せず、ページの閲覧状況やパフォーマンス指標を匿名で収集します。
          </li>
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <Heading level="h3">お問い合わせで取得する情報</Heading>
        <p className="leading-relaxed">
          サイト内のお問い合わせフォームでは、入力されたメッセージ本文のみを保存します。氏名やメールアドレスなどの個人情報は収集しません。保存した内容は、お問い合わせへの対応とサイト改善の目的にのみ使用します。メールやGitHub
          Issueで連絡をもらった場合も、その内容を対応以外の目的に使用することはありません。
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <Heading level="h3">広告について</Heading>
        <p className="leading-relaxed">
          当サイトは広告を掲載していません。第三者の広告配信サービスに利用者の情報を提供することもありません。
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <Heading level="h3">本ポリシーの変更</Heading>
        <p className="leading-relaxed">
          使用するツールの追加や変更があった場合は、本ページの内容を更新して告知します。本ポリシーについての質問は
          <Anchor href="/contact">Contact</Anchor>
          に記載の手段で連絡してください。
        </p>
        <p className="text-fg-mute text-sm">制定日: 2026年8月24日</p>
      </section>
    </>
  );
}
