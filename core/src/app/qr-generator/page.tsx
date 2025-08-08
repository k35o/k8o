import { QrGenerator } from './_components/qr-generator';

export default function Page() {
  return (
    <section className="grid h-full gap-6 rounded-md bg-bg-base p-10">
      <QrGenerator />
    </section>
  );
}
