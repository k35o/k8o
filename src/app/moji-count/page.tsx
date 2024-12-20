import { TextField } from './_components/text-field';
import { isSegmenter } from './_utils/count-text';

export default function Counter() {
  return (
    <section className="flex h-full flex-col justify-between gap-4 rounded-lg bg-bgBase/55 p-10">
      <TextField />
      <div className="text-right">
        {isSegmenter ? (
          <p className="text-sm">
            ※書記素単位に分解して文字数を計測しています
          </p>
        ) : (
          <p className="text-sm">
            ※ユニコードのコードポイント単位で文字数を計測しています
          </p>
        )}
      </div>
    </section>
  );
}
