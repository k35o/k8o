import { AppCard } from '../_components/app-card';
import { RoundedIcon } from './_components/rounded-icon';

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <AppCard
        link="/designs/rounded"
        emotion={<RoundedIcon />}
        title="かどまるラボ"
        description="角丸を決めてお気に入りの図形を探しましょう"
      />
    </div>
  );
}
