'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { DropdownMenu } from '@k8o/arte-odyssey/dropdown-menu';
import { Tooltip } from '@k8o/arte-odyssey/tooltip';
import { FC } from 'react';

export const TooltipDropdownDemo: FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="itesm-center flex flex-wrap justify-around gap-4">
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold md:text-xl">Tooltip</p>
          <Tooltip.Root placement="bottom">
            <Tooltip.Trigger
              renderItem={(props) => (
                <Button type="button" {...props}>
                  Trigger
                </Button>
              )}
            />
            <Tooltip.Content>
              <p>Tooltip content</p>
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold md:text-xl">
            Dropdown Menu
          </p>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger text="Options" variant="outlined" />
            <DropdownMenu.Content>
              <DropdownMenu.Item
                label="Item 1"
                onClick={() => {
                  alert('Item 1 clicked');
                }}
              />
              <DropdownMenu.Item
                label="Item 2"
                onClick={() => {
                  alert('Item 2 clicked');
                }}
              />
              <DropdownMenu.Item
                label="Item 3"
                onClick={() => {
                  alert('Item 3 clicked');
                }}
              />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
      <p className="text-fg-mute self-center text-xs md:text-sm">
        このUIの実装はPopover APIを使っていません。
      </p>
    </div>
  );
};
