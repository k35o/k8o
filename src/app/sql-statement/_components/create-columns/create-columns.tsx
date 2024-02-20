import { FC } from 'react';
import { Column, InvalidColumns } from '../../_types/column';
import { Button } from '@/app/_components/button';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@/app/_components/accordion';
import { IconButton } from '@/app/_components/icon-button';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { CreateColumn } from '../create-column';

type Props = {
  columns: Record<string, Column>;
  setColumns: (columns: Record<string, Column>) => void;
  columnsError: InvalidColumns['errors'] | undefined;
};

export const CreateColumns: FC<Props> = ({
  columns,
  setColumns,
  columnsError,
}) => {
  const columnsEntries = Object.entries(columns);
  return (
    <fieldset className="rounded-md px-4 py-2">
      <div className="flex items-center justify-between py-2">
        <legend className="text-lg font-bold">カラム情報</legend>
        <Button
          onClick={() =>
            setColumns({
              ...columns,
              [crypto.randomUUID()]: {
                name: '',
                alias: '',
                type: 'uuid',
                nullable: false,
              },
            })
          }
        >
          カラムを追加
        </Button>
      </div>
      <Accordion>
        {columnsEntries.map(([id, column], idx) => {
          const columnError = columnsError && columnsError[id];
          return (
            <AccordionItem key={id} defaultOpen={true}>
              <AccordionButton>
                <p className="text-lg font-bold">カラム{idx + 1}</p>
              </AccordionButton>
              <AccordionPanel>
                <div className="relative">
                  {columnsEntries.length > 1 && (
                    <div className="absolute flex w-full items-center justify-end">
                      <IconButton
                        label="削除"
                        size="sm"
                        onClick={() => {
                          if (columnsEntries.length <= 1) {
                            return;
                          }
                          setColumns(
                            Object.fromEntries(
                              columnsEntries.filter(
                                ([columnId]) => columnId !== id,
                              ),
                            ),
                          );
                        }}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </IconButton>
                    </div>
                  )}
                  <CreateColumn
                    column={column}
                    setColumn={(value) =>
                      setColumns(
                        Object.fromEntries(
                          columnsEntries.map(([columnId, column]) => {
                            if (columnId === id) {
                              return [columnId, value];
                            }
                            return [columnId, column];
                          }),
                        ),
                      )
                    }
                    columnError={columnError}
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
