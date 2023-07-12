import { BaseConverter } from './components/base-converter';
import { ColorConverter } from './components/color-converter';

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-l font-medium">進数</h3>
        <div className="rounded-md bg-white p-4 shadow-md">
          <BaseConverter />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-l font-medium">カラーコード</h3>
        <div className="rounded-md bg-white p-4 shadow-md">
          <ColorConverter />
        </div>
      </div>
    </div>
  );
}
