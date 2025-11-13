import { ColorConverter } from './_components/color-converter';

export default function Page() {
  return (
    <section className="grid h-full gap-6 rounded-md bg-bg-base p-10">
      <ColorConverter />
    </section>
  );
}
