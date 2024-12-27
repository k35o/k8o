import { useCallback } from 'react';
import { Column } from '../../_types/column';
import { Restriction } from '../../_types/restriction';
import { uuidV4 } from '@/utils/uuid-v4';

export const useCreateColumns = (
  columns: Record<string, Column>,
  setColumns: (columns: Record<string, Column>) => void,
  setRestrictions: (
    arg: (
      restrictions: Record<string, Restriction>,
    ) => Record<string, Restriction>,
  ) => void,
) => {
  const columnsEntries = Object.entries(columns);

  const handleAddColumn = useCallback(() => {
    setColumns({
      ...columns,
      [uuidV4()]: {
        name: '',
        alias: '',
        type: 'uuid',
        nullable: false,
      },
    });
  }, [columns, setColumns]);

  const handleChangeColumn = useCallback(
    (id: string) => (value: Column) => {
      setColumns(
        Object.fromEntries(
          columnsEntries.map(([columnId, column]) => {
            if (columnId === id) {
              return [columnId, value];
            }
            return [columnId, column];
          }),
        ),
      );
    },
    [columnsEntries, setColumns],
  );

  const handleDeleteColumn = useCallback(
    (id: string) => () => {
      if (columnsEntries.length <= 1) {
        return;
      }
      setRestrictions((restrictions) => {
        return Object.fromEntries<Restriction>(
          Object.entries(restrictions).map(
            ([restrictionId, restriction]) => {
              if (restriction.type === 'foreign') {
                const firstColumn = Object.keys(columns)[0] ?? '';
                return [
                  restrictionId,
                  {
                    ...restriction,
                    column:
                      restriction.column === id
                        ? firstColumn
                        : restriction.column,
                  },
                ];
              }
              return [
                restrictionId,
                {
                  ...restriction,
                  columns: restriction.columns.filter(
                    (columnId) => columnId !== id,
                  ),
                },
              ];
            },
          ),
        );
      });
      setColumns(
        Object.fromEntries(
          columnsEntries.filter(([columnId]) => columnId !== id),
        ),
      );
    },
    [columns, columnsEntries, setColumns, setRestrictions],
  );

  return {
    handleAddColumn,
    handleChangeColumn,
    handleDeleteColumn,
  };
};
