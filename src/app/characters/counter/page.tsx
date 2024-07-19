import { TextField } from './_components/text-field';

export default function Counter() {
  return (
    <section className="flex h-full flex-col justify-between gap-4 rounded-md bg-white p-10">
      <TextField />
      <div className="mt-4 text-right">
        <p className="text-sm">
          ※書記素単位に分解して文字数を計測しています
        </p>
        <p className="text-sm">
          ※ブラウザによってユニコードのコードポイント単位での計測になります
        </p>
      </div>
    </section>
  );
}
