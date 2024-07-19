import { Heading } from '../../components/heading';
import { BaseConverter } from './_components/base-converter';
import { ColorConverter } from './_components/color-converter';

export default function Page() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <Heading type="h3">進数変換</Heading>
        <div className="rounded-lg bg-white p-8">
          <BaseConverter />
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <Heading type="h3">カラーコード変換</Heading>
        <div className="rounded-lg bg-white p-8">
          <ColorConverter />
        </div>
      </section>
    </div>
  );
}
