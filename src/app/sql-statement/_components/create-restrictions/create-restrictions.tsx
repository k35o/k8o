import { FC } from 'react';
import { Column } from '../../_types/column';
import { Button } from '@/app/_components/button';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@/app/_components/accordion';
import { IconButton } from '@/app/_components/icon-button';
import { XMarkIcon } from '@heroicons/react/24/solid';
import {
  InvalidRestrictions,
  Restriction,
} from '../../_types/restriction';
import { CreateRestriction } from '../create-restriction/create-restriction';

type Props = {
  columns: Record<string, Column>;
  restrictions: Record<string, Restriction>;
  setRestrictions: (
    restrictions: Record<string, Restriction>,
  ) => void;
  restroctionsError: InvalidRestrictions['errors'] | undefined;
};

export const CreateRestrictions: FC<Props> = ({
  columns,
  restrictions,
  setRestrictions,
  restroctionsError,
}) => {
  const restrictionsEntries = Object.entries(restrictions);
  return (
    <fieldset className="rounded-md px-4 py-2">
      <div className="flex items-center justify-between py-2">
        <legend className="text-lg font-bold">制限</legend>
        <Button
          onClick={() =>
            setRestrictions({
              ...restrictions,
              [crypto.randomUUID()]: {
                type: 'primary',
                columns: [],
              },
            })
          }
        >
          カラムを追加
        </Button>
      </div>
      <Accordion>
        {restrictionsEntries.map(([id, restriction], idx) => {
          const restrictionError =
            restroctionsError && restroctionsError[id];
          return (
            <AccordionItem key={id} defaultOpen={true}>
              <AccordionButton>
                <p className="text-lg font-bold">制約{idx + 1}</p>
              </AccordionButton>
              <AccordionPanel>
                <div className="relative">
                  {restrictionsEntries.length > 0 && (
                    <div className="absolute flex w-full items-center justify-end">
                      <IconButton
                        label="削除"
                        size="sm"
                        onClick={() => {
                          setRestrictions(
                            Object.fromEntries(
                              restrictionsEntries.filter(
                                ([restrictionId]) =>
                                  restrictionId !== id,
                              ),
                            ),
                          );
                        }}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </IconButton>
                    </div>
                  )}
                  <CreateRestriction
                    columns={columns}
                    restriction={restriction}
                    setRestriction={(value) =>
                      setRestrictions(
                        Object.fromEntries(
                          restrictionsEntries.map(
                            ([restrictionId, restriction]) => {
                              if (restrictionId === id) {
                                return [restrictionId, value];
                              }
                              return [restrictionId, restriction];
                            },
                          ),
                        ),
                      )
                    }
                    restrictionError={restrictionError}
                  />
                </div>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </fieldset>
  );
};
