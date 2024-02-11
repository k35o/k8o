import { CheckContrast } from './_components/check-contrast';
import { Description } from './_components/description';

export default function Page() {
  return (
    <section className="flex flex-col gap-6">
      <CheckContrast />
      <Description />
    </section>
  );
}
