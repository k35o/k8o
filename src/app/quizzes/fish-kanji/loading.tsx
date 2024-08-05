import { LinkButton } from '@/components/link-button';

export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex w-full items-center justify-end">
        <LinkButton href="/quizzes/fish-kanji/list">
          うおへんの漢字一覧
        </LinkButton>
      </div>
      <div className="flex grow items-center justify-center">
        <p className="text-2xl font-bold">問題を読み込み中です...</p>
      </div>
    </div>
  );
}
