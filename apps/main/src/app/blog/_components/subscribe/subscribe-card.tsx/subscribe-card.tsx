import { MailIcon, RSSIcon, SubscribeIcon } from '@k8o/arte-odyssey/icons';
import { Tabs } from '@k8o/arte-odyssey/tabs';
import type { FC } from 'react';
import { MailPanel } from './mail-panel';
import { RssPanel } from './rss-panel';

export const SubscribeCard: FC = () => {
  return (
    <section className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border-mute p-4">
      <h2 className="flex items-center gap-2 font-bold text-lg">
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
