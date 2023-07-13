import { Heading } from '../_components/heading';
import { BaseConverter } from './_components/base-converter';
import { ColorConverter } from './_components/color-converter';

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <Heading type="h3">進数</Heading>
        <div className="rounded-md bg-white p-4 shadow-md">
          <BaseConverter />
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <Heading type="h3">カラーコード</Heading>
        <div className="rounded-md bg-white p-4 shadow-md">
          <ColorConverter />
        </div>
      </section>
    </div>
  );
}
