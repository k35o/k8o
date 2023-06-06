import { AppCard } from '@/components/app-card';

export default function Home() {
  return (
    <div>
      <AppCard
        link="/characters"
        emotion="🔠"
        title="Characters"
        description="テキストエリアに入力した文字数をカウントする機能など、文字に対する操作についての機能を提供するサービスです。"
      />
    </div>
  );
}
