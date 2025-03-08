import { Column } from '../../_types/column';
import {
  InvalidRestrictions,
  Restriction,
} from '../../_types/restriction';
import { CreateRestriction } from '../create-restriction/create-restriction';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@/components/accordion';
import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button';
import { Close } from '@/components/icons';
import { uuidV4 } from '@/utils/uuid-v4';
import { FC } from 'react';

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
    <fieldset className="p-2">
      <div className="flex items-center justify-between py-2">
        <legend className="text-lg font-bold">制限</legend>
        <Button
          onClick={() => {
            setRestrictions({
              ...restrictions,
              [uuidV4()]: {
                type: 'primary',
                columns: [],
              },
            });
          }}
        >
          制約を追加
        </Button>
      </div>
      <Accordion>
        {restrictionsEntries.map(([id, restriction], idx) => {
          const restrictionError = restroctionsError?.[id];
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
                        <Close />
                      </IconButton>
                    </div>
                  )}
                  <CreateRestriction
                    columns={columns}
                    restriction={restriction}
                    setRestriction={(value) => {
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
                      );
                    }}
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
