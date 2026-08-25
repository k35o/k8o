import { Anchor, Heading } from '@k8o/arte-odyssey';

export default function Page() {
  return (
    <>
      <p className="leading-relaxed">
        k8oへの連絡には次の手段が使えます。記事の内容への質問や誤りの指摘、登壇や執筆の相談、公開しているツールへのフィードバックなど、内容は問いません。個人で運営しているため、返信までに時間がかかることや、営業目的の連絡には返信しないことがあります。
      </p>
      <section className="flex flex-col gap-3">
        <Heading level="h3">お問い合わせフォーム</Heading>
        <p className="leading-relaxed">
          サイトヘッダーの送信アイコンから、お問い合わせフォームを開けます。名前やメールアドレスの入力は不要で、メッセージだけを送信できます。送信された内容はすべて目を通しています。匿名のため返信はできません。返信が必要な場合はメールを使ってください。
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <Heading level="h3">メール</Heading>
        <p className="leading-relaxed">
          <Anchor href="mailto:k8o@k8o.me">k8o@k8o.me</Anchor>
          宛てに送ってください。返信が必要な相談や、公開の場に書きにくい内容はこちらが確実です。数日以内の返信を心がけていますが、遅れることもあります。
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <Heading level="h3">GitHub Issue</Heading>
        <p className="leading-relaxed">
          このサイトの不具合報告や改善要望は、
          <Anchor href="https://github.com/k35o/k8o/issues/new" openInNewTab>
            GitHubリポジトリのIssue
          </Anchor>
          で受け付けています。再現手順や期待する挙動を書いてもらえると助かります。Pull
          Requestも歓迎しています。
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <Heading level="h3">SNS</Heading>
        <p className="leading-relaxed">
          <Anchor href="https://x.com/k8ome" openInNewTab>
            X（@k8ome）
          </Anchor>
          のDMやリプライでも連絡できます。ブログ記事への感想や短い質問はXが目に留まりやすいです。気軽に声をかけてください。
        </p>
      </section>
    </>
  );
}
