import { Heading } from '@/components/heading';
import { LinkButton } from '@/components/link-button';

export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex w-full items-center justify-between">
        <Heading type="h4">漢字一覧</Heading>
        <LinkButton href="/quizzes/fish-kanji">問題を解く</LinkButton>
      </div>
      <div className="flex grow items-center justify-center">
        <p className="text-2xl font-bold">漢字を読み込み中です...</p>
      </div>
    </div>
  );
}
