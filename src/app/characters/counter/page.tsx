import { TextField } from './components/text-field';
import { TextLength } from './components/text-length';

export default function Counter() {
  return (
    <div>
      <TextField />
      <div className="flex gap-2">
        <p>文字数：</p>
        <p>
          <TextLength />
        </p>
      </div>
      <div className="mt-4 text-right">
        <p className="text-sm text-gray-600">
          ※書記素単位に分解して文字数を計測しています
        </p>
        <p className="text-sm text-gray-600">
          ※ブラウザによってユニコードのコードポイント単位での計測になります
        </p>
      </div>
    </div>
  );
}
