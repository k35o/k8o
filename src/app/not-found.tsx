import Image from 'next/image';
import notFoundImage from './_images/404.png';

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image alt="404 Not Found" src={notFoundImage} />
    </div>
  );
}
