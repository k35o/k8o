'use client';

import { Button, Code } from '@k8o/arte-odyssey';
import { useEffect, useRef, useState } from 'react';

// Baseline 2026で追加された source プロパティをTypeScriptの型に拡張
type ToggleEventWithSource = ToggleEvent & { source?: Element | null };

// showPopover が source オプションを受けるシグネチャの型補完
type ShowPopoverOptions = { source?: Element };

type Member = {
  id: string;
  name: string;
  role: string;
  bio: string;
};

const MEMBERS: readonly Member[] = [
  {
    id: 'alice',
    name: 'Alice',
    role: 'Frontend Engineer',
    bio: 'TypeScript と Web Standards をひたすら追いかける人',
  },
  {
    id: 'bob',
    name: 'Bob',
    role: 'Designer',
    bio: 'デザインシステムとアクセシビリティに強い',
  },
  {
    id: 'carol',
    name: 'Carol',
    role: 'Product Manager',
    bio: 'ロードマップ整理とユーザーリサーチが本職',
  },
];

const FALLBACK: Member = {
  id: '',
  name: '—',
  role: '—',
  bio: 'ボタンから開いてください',
};

const POPOVER_ID = 'toggleevent-source-member-card';

type ToggleLog = {
  oldState: string;
  newState: string;
  memberId: string | null;
  buttonText: string | null;
};

const INITIAL_LOG: ToggleLog = {
  oldState: '—',
  newState: '—',
  memberId: null,
  buttonText: null,
};

export function ToggleEventSourceDemo() {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Member>(FALLBACK);
  const [toggleLog, setToggleLog] = useState<ToggleLog>(INITIAL_LOG);

  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return undefined;

    const onToggle = (event: Event) => {
      const toggleEvent = event as ToggleEventWithSource;
      const { source } = toggleEvent;
      const sourceEl = source instanceof HTMLElement ? source : null;
      const memberId = sourceEl?.dataset['memberId'] ?? null;

      setToggleLog({
        oldState: toggleEvent.oldState,
        newState: toggleEvent.newState,
        memberId,
        buttonText: sourceEl ? sourceEl.textContent.trim() : null,
      });

      if (toggleEvent.newState !== 'open') return;
      const member = MEMBERS.find((m) => m.id === memberId);
      if (member) setActive(member);
    };

    popover.addEventListener('toggle', onToggle);
    return () => {
      popover.removeEventListener('toggle', onToggle);
    };
  }, []);

  // popover が開いている状態で別のボタンを押されても再ショーされるよう、
  // 明示的に hide → show でやり直して source を毎回更新する。
  const openWithSource = (button: HTMLElement) => {
    const popover = popoverRef.current;
    if (!popover) return;
    if (popover.matches(':popover-open')) {
      popover.hidePopover();
    }
    (popover.showPopover as (options?: ShowPopoverOptions) => void)({
      source: button,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-fg-mute text-sm">
        どのメンバーの「詳細」を押しても同じポップオーバーが開きます。
        <Code>toggle</Code>イベントの<Code>event.source</Code>
        から発火元のボタンを取って、その<Code>data-member-id</Code>
        で表示内容を切り替えます。
      </p>

      <ul className="flex flex-col gap-2">
        {MEMBERS.map((member) => (
          <li
            className="bg-bg-base flex items-center justify-between rounded-md p-3"
            key={member.id}
          >
            <div>
              <p className="text-fg-base font-bold">{member.name}</p>
              <p className="text-fg-mute text-xs">{member.role}</p>
            </div>
            <Button
              aria-label={`${member.name}の詳細`}
              data-member-id={member.id}
              onClick={(e) => {
                openWithSource(e.currentTarget);
              }}
              size="sm"
            >
              詳細
            </Button>
          </li>
        ))}
      </ul>

      <div className="bg-bg-subtle text-fg-mute rounded-md p-3 font-mono text-xs">
        <p>最新の toggle イベントから取った情報（open / close 両方）</p>
        <p>event.oldState: {JSON.stringify(toggleLog.oldState)}</p>
        <p>event.newState: {JSON.stringify(toggleLog.newState)}</p>
        <p>event.source.textContent: {JSON.stringify(toggleLog.buttonText)}</p>
        <p>
          event.source.dataset.memberId: {JSON.stringify(toggleLog.memberId)}
        </p>
      </div>

      <div
        className="bg-bg-base m-auto w-72 rounded-md p-4 shadow-md"
        id={POPOVER_ID}
        popover="auto"
        ref={popoverRef}
      >
        <p className="text-fg-base font-bold">{active.name}</p>
        <p className="text-fg-mute mt-1 text-xs">{active.role}</p>
        <p className="text-fg-base mt-2 text-sm">{active.bio}</p>
        <div className="mt-3 flex justify-end">
          {/* popovertarget の hide ボタンで閉じると、閉じる方向のtoggleでこのボタンが source になる */}
          <Button
            data-member-id="close"
            popoverTarget={POPOVER_ID}
            popoverTargetAction="hide"
            size="sm"
            variant="outline"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}
