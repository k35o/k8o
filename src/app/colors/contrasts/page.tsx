import { CheckContrast } from './_components/check-contrast';
import { Description } from './_components/description';

export default function Page() {
  return (
    <section className="flex h-full flex-col justify-between gap-6 rounded-lg bg-white p-10">
      <CheckContrast />
      <Description />
    </section>
  );
}
