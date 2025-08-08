import { CheckContrast } from './_components/check-contrast';
import { Description } from './_components/description';

export default function Page() {
  return (
    <section className="grid h-full gap-6 rounded-md bg-bg-base p-10">
      <CheckContrast />
      <Description />
    </section>
  );
}
