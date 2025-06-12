import { QrGenerator } from './_components/qr-generator';

export default function Page() {
  return (
    <section className="bg-bg-base grid h-full gap-6 rounded-md p-10">
      <QrGenerator />
    </section>
  );
}
