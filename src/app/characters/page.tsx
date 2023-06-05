import { AppCard } from './components/app-card';

export default function Page() {
  return (
    <div>
      <AppCard
        link="/characters/counter"
        emotion="📏"
        title="文字数カウンター"
        description="入力した文字列の長さをカウントします。"
      />
    </div>
  );
}
