import { Heading } from '@/components/heading';
import { notFound } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; message?: string }>;
}) {
  const { status, message } = await searchParams;
  if (status === undefined) {
    notFound();
  }
  const isSuccess = status === 'true';

  return (
    <section className="bg-bg-base grid h-full gap-6 rounded-md p-10">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <Heading type="h2">購読が完了しました</Heading>
          <p>ご登録いただきありがとうございます。</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <Heading type="h2">購読に失敗しました</Heading>
          <p>
            {message ?? '不明なエラーが発生しました。'}
            <br />
            お手数ですが、再度ご登録をお願いいたします。
          </p>
          <p className="text-fg-base">
            それでも解決しない場合は、ヘッダーの「お問い合わせ」から連絡ください。
          </p>
        </div>
      )}
    </section>
  );
}
