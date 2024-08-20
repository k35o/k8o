import { BaseConverter } from './_components/base-converter';

export default function Page() {
  return (
    <section className="flex h-full flex-col justify-between gap-6 rounded-lg bg-bgBase p-10">
      <BaseConverter />
    </section>
  );
}
