import { Heading } from '@/components/heading';
import { FishKanjiCollection } from '../_components/fish-kanji-collection';
import { LinkButton } from '@/components/link-button';

export default function Page() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Heading type="h4">漢字一覧</Heading>
        <LinkButton href="/quizzes/fish-kanji">問題を解く</LinkButton>
      </div>
      <FishKanjiCollection />
    </div>
  );
}
