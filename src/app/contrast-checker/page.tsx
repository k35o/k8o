import { CheckContrast } from './_components/check-contrast';
import { Description } from './_components/description';

export default function Page() {
  return (
    <section className="bg-bg-base grid h-full gap-6 rounded-lg p-10">
      <CheckContrast />
      <Description />
    </section>
  );
}
