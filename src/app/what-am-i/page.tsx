import Image from 'next/image';
import k8o from './_images/k8o.jpg';
import { Heading } from '../../components/heading';
import { GithubMark } from '../../components/icons';
import { Zenn } from '../../components/icons/zenn';
import { Twitter } from '../../components/icons/twitter';
import { Qiita } from '../../components/icons/qiita';
import { IconLink } from '../../components/icon-link';

export default function Page() {
  return (
    <div className="mt-2 flex h-full flex-col items-center gap-8 rounded-lg bg-white p-8">
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
          <IconLink href="https://github.com/k35o">
            <GithubMark
              title="GitHubのアカウント"
              className="h-8 w-8"
            />
          </IconLink>
          <IconLink href="https://twitter.com/k8o1024">
            <Twitter title="Xのアカウント" className="h-8 w-8" />
          </IconLink>
          <IconLink href="https://zenn.dev/kokisakano">
            <Zenn title="Zennのアカウント" className="h-8 w-8" />
          </IconLink>
          <IconLink href="https://qiita.com/KokiSakano">
            <Qiita title="Qiitaのアカウント" className="h-8 w-8" />
          </IconLink>
        </div>
      </div>
    </div>
  );
}
