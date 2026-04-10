import { Spinner } from '@k8o/arte-odyssey';

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner label="読み込み中" size="lg" />
    </div>
  );
}
