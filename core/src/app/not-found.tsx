import notFoundImage from './_images/404.png';
import { LinkButton } from '@k8o/components/link-button';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image alt="404 Not Found" src={notFoundImage} />
      <LinkButton href="/" size="lg">
        トップへ戻る
      </LinkButton>
    </div>
  );
}
