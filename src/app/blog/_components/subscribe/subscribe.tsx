import { SubscribeCard } from './subscribe-card.tsx';
import { Drawer } from '@/components/drawer/drawer';
import { Checkbox } from '@/components/form/checkbox';
import { IconButton } from '@/components/icon-button';
import { SubscribeIcon } from '@/components/icons';
import { Separator } from '@/components/separator';
import { useLocalStorage } from '@/hooks/local-storage';
import { FC, useState } from 'react';

export const Subscribe: FC<{
  reading?: boolean;
}> = ({ reading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWhileReading, setShowWhileReading] = useLocalStorage(
    'show-while-reading',
    true,
  );

  if (reading && !showWhileReading) {
    return null;
  }

  return (
    <>
      <IconButton
        bg="base"
        label="ブログの購読"
        onClick={() => { setIsOpen(true); }}
      >
        <SubscribeIcon />
      </IconButton>
      <Drawer
        title="ブログの購読"
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); }}
      >
        <div className="flex flex-col items-center justify-between gap-6">
          <SubscribeCard />
          <Separator />
          <div>
            <Checkbox
              label="読書中は自動的に非表示にする"
              value={!showWhileReading}
              onChange={(e) =>
                { setShowWhileReading(!e.currentTarget.checked); }
              }
            />
          </div>
        </div>
      </Drawer>
    </>
  );
};
