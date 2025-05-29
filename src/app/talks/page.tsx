import { TalkCard } from './_components/talk-card';
import { getTalks } from '@/services/talks/talks';

export default async function Page() {
  const talks = await getTalks();
  return (
    <div className="flex flex-col gap-4">
      {talks.map((talk) => (
        <TalkCard key={talk.id} {...talk} />
      ))}
    </div>
  );
}
