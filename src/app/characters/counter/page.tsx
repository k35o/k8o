import { TextField } from './_components/text-field';

export default function Counter() {
  return (
    <section>
      <TextField />
      <div className="mt-4 text-right">
        <p className="text-sm text-textGray">
          ※書記素単位に分解して文字数を計測しています
        </p>
        <p className="text-sm text-textGray">
          ※ブラウザによってユニコードのコードポイント単位での計測になります
        </p>
      </div>
    </section>
  );
}
