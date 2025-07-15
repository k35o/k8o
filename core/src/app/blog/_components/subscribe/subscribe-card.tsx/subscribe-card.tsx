import { MailPanel } from './mail-panel';
import { RssPanel } from './rss-panel';
import { MailIcon, RSSIcon, SubscribeIcon } from '@/components/icons';
import { Tabs } from '@/components/tabs';
import { FC } from 'react';

export const SubscribeCard: FC = () => {
  return (
    <section className="border-border-mute flex flex-col items-center justify-center gap-2 rounded-lg border p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <SubscribeIcon />
        k8oのブログを購読する
      </h2>
      <p className="text-fg-mute text-sm">
        k8oのブログを購読することで、最新の情報を受け取ることができます。
      </p>
      <div className="w-full p-1">
        <Tabs.Root ids={['mail', 'rss']}>
          <Tabs.List label="購読の種類">
            <Tabs.Tab id="mail">
              <span className="flex items-center gap-2">
                <MailIcon />
                メール通知
              </span>
            </Tabs.Tab>
            <Tabs.Tab id="rss">
              <span className="flex items-center gap-2">
                <RSSIcon />
                RSSフィード
              </span>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="mail">
            <MailPanel />
          </Tabs.Panel>
          <Tabs.Panel id="rss">
            <RssPanel />
          </Tabs.Panel>
        </Tabs.Root>
      </div>
    </section>
  );
};
