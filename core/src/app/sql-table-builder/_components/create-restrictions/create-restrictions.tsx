import { Accordion } from '@k8o/arte-odyssey/accordion';
import { Button } from '@k8o/arte-odyssey/button';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { CloseIcon } from '@k8o/arte-odyssey/icons';
import { uuidV4 } from '@k8o/helpers/uuid-v4';
import type { FC } from 'react';
import type { Column } from '../../_types/column';
import type {
  InvalidRestrictions,
  Restriction,
} from '../../_types/restriction';
import { CreateRestriction } from '../create-restriction/create-restriction';

type Props = {
  columns: Record<string, Column>;
  restrictions: Record<string, Restriction>;
  setRestrictions: (restrictions: Record<string, Restriction>) => void;
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
        <legend className="font-bold text-lg">制限</legend>
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
      <Accordion.Root>
        {restrictionsEntries.map(([id, restriction], idx) => {
          const restrictionError = restroctionsError?.[id];
          return (
            <Accordion.Item defaultOpen={true} key={id}>
              <Accordion.Button>
                <p className="font-bold text-lg">制約{idx + 1}</p>
              </Accordion.Button>
              <Accordion.Panel>
                <div className="relative">
                  {restrictionsEntries.length > 0 && (
                    <div className="absolute flex w-full items-center justify-end">
                      <IconButton
                        label="削除"
                        onClick={() => {
                          setRestrictions(
                            Object.fromEntries(
                              restrictionsEntries.filter(
                                ([restrictionId]) => restrictionId !== id,
                              ),
                            ),
                          );
                        }}
                        size="sm"
                      >
                        <CloseIcon />
                      </IconButton>
                    </div>
                  )}
                  <CreateRestriction
                    columns={columns}
                    restriction={restriction}
                    restrictionError={restrictionError}
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
                  />
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </fieldset>
  );
};
