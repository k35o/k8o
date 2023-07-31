import Image from 'next/image';
import k8o from './_images/k8o.jpg';
import { Heading } from '../_components/heading';
import { Anchor } from '../_components/anchor';
import { GithubMark } from '../_components/icons';
import { Zenn } from '../_components/icons/zenn';
import { Twitter } from '../_components/icons/twitter';
import { Qiita } from '../_components/icons/qiita';

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-8">
      <Image
        className="rounded-full"
        src={k8o}
        width={360}
        height={360}
        alt="k8oのアイコン"
      />
      <div className="flex flex-col items-center justify-center gap-2">
        <Heading type="h3">k8o</Heading>
        <div className="flex items-center justify-center gap-2">
          <Anchor href="https://github.com/k35o">
            <GithubMark className="h-8 w-8" />
          </Anchor>
          <Anchor href="https://twitter.com/k8o1024">
            <Twitter className="h-8 w-8" />
          </Anchor>
          <Anchor href="https://zenn.dev/kokisakano">
            <Zenn className="h-8 w-8" />
          </Anchor>
          <Anchor href="https://qiita.com/KokiSakano">
            <Qiita className="h-8 w-8" />
          </Anchor>
        </div>
      </div>
    </div>
  );
}
