import { ColorQuizIndex } from '@/components/color-quiz/color-quiz-index/color-quiz-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function ColorQuizPage() {
  return (
    <>
      <PageMeta
        description="色からHexコードを当てたり、Hexコードから色を選ぶクイズです。"
        image={{ path: '/color-quiz/og.png', alt: 'カラーHexクイズ' }}
        path="/color-quiz"
        title="カラーHexクイズ"
      />
      <ColorQuizIndex />
    </>
  );
}
