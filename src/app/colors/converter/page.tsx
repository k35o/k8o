import { ColorConverter } from './_components/color-converter';

export default function Page() {
  return (
    <section className="flex h-full flex-col justify-between gap-6 rounded-lg bg-bgBase/55 p-10">
      <ColorConverter />
    </section>
  );
}
