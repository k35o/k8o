import { FC } from 'react';
import { CreatingColumn } from '../../_types/column';
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
  columns: CreatingColumn[];
  setColumns: (columns: CreatingColumn[]) => void;
};

export const CreateColumns: FC<Props> = ({ columns, setColumns }) => {
  return (
    <fieldset className="rounded-md px-4 py-2">
      <div className="flex items-center justify-between py-2">
        <legend className="text-lg font-bold">カラム情報</legend>
        <Button
          onClick={() =>
            setColumns([
              ...columns,
              {
                id: crypto.randomUUID(),
                name: '',
                alias: '',
                type: 'uuid',
                nullable: false,
              },
            ])
          }
        >
          カラムを追加
        </Button>
      </div>
      <Accordion>
        {columns.map((column, idx) => {
          return (
            <AccordionItem key={column.id} defaultOpen={true}>
              <AccordionButton>
                <p className="text-lg font-bold">カラム{idx + 1}</p>
              </AccordionButton>
              <AccordionPanel>
                <div className="relative">
                  {columns.length > 1 && (
                    <div className="absolute flex w-full items-center justify-end">
                      <IconButton
                        label="削除"
                        size="sm"
                        onClick={() => {
                          if (columns.length <= 1) {
                            return;
                          }
                          setColumns(
                            columns.filter(
                              (value) => column.id === value.id,
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
                        columns.map((column) => {
                          if (column.id === value.id) {
                            return value;
                          }
                          return column;
                        }),
                      )
                    }
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
