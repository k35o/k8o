'use client';

/* eslint-disable import/max-dependencies -- SQL table builder 画面のフォーム部品を page entry で組み立てるため */

import {
  Button,
  Card,
  CopyIcon,
  IconButton,
  useClipboard,
  useToast,
} from '@k8o/arte-odyssey';
import { uuidV4 } from '@repo/helpers/uuid-v4';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

import { LoadingCreateColumns } from './_components/create-columns/loading-create-columns';
import { CreateRestrictions } from './_components/create-restrictions';
import { CreateTable } from './_components/create-table';
import type { Column, InvalidColumns } from './_types/column';
import type { InvalidRestrictions, Restriction } from './_types/restriction';
import type { InvalidTable, Table } from './_types/table';
import { makeStatement } from './_utils/statement';

const CreateColumns = dynamic(
  () => import('./_components/create-columns').then((mod) => mod.CreateColumns),
  { ssr: false, loading: () => <LoadingCreateColumns /> },
);

const StepIndicator = ({
  step,
  title,
  isActive = true,
}: {
  step: number;
  title: string;
  isActive?: boolean;
}) => (
  <div className="flex items-center gap-2 sm:gap-3">
    <div
      className={`flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors sm:h-8 sm:w-8 sm:text-sm ${
        isActive ? 'bg-bg-primary text-fg-onFill' : 'bg-bg-mute text-fg-mute'
      }`}
    >
      {step}
    </div>
    <h3 className="text-base font-bold sm:text-lg">{title}</h3>
  </div>
);

export default function Page() {
  const topRef = useRef<HTMLElement | null>(null);
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const [table, setTable] = useState<Table>({
    name: '',
    alias: '',
  });
  const [columns, setColumns] = useState<Record<string, Column>>({
    [uuidV4()]: {
      name: '',
      alias: '',
      type: 'uuid',
      nullable: false,
    },
  });
  const [restrictions, setRestrictions] = useState<Record<string, Restriction>>(
    {
      [uuidV4()]: {
        type: 'primary',
        columns: [],
      },
    },
  );

  const [statement, setStatement] = useState<string>('');
  const [tableError, setTableError] = useState<InvalidTable['errors']>();
  const [columnsError, setColumnsError] = useState<InvalidColumns['errors']>();
  const [restrictionsError, setRestrictionsError] =
    useState<InvalidRestrictions['errors']>();

  const handleCopy = async () => {
    await writeClipboard(statement);
    setIsCopied(true);
    onOpen('success', 'コピーしました');
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleGenerate = () => {
    setTableError(undefined);
    setColumnsError(undefined);
    setRestrictionsError(undefined);
    setStatement('');
    const statementResult = makeStatement(table, columns, restrictions);
    if (!statementResult.isSuccessful) {
      setTableError(statementResult.invalidTable?.errors);
      setColumnsError(statementResult.invalidColumns?.errors);
      setRestrictionsError(statementResult.invalidRestrictions?.errors);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setStatement(statementResult.statement);
  };

  return (
    <section className="grid gap-6 py-4" ref={topRef}>
      {/* Step 1: テーブル情報 */}
      <div>
        <Card>
          <div className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <StepIndicator step={1} title="テーブル情報" />
              <p className="text-fg-mute mt-2 text-sm sm:pl-11">
                作成するテーブルの基本情報を入力してください
              </p>
            </div>
            <div className="sm:pl-11">
              <CreateTable
                setTable={setTable}
                table={table}
                tableError={tableError}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Step 2: カラム情報 */}
      <div>
        <Card>
          <div className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <StepIndicator step={2} title="カラム情報" />
              <p className="text-fg-mute mt-2 text-sm sm:pl-11">
                テーブルに含めるカラムを定義してください
              </p>
            </div>
            <div className="sm:pl-11">
              <CreateColumns
                columns={columns}
                columnsError={columnsError}
                setColumns={setColumns}
                setRestrictions={setRestrictions}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Step 3: 制約 */}
      <div>
        <Card>
          <div className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <StepIndicator step={3} title="制約" />
              <p className="text-fg-mute mt-2 text-sm sm:pl-11">
                主キーや外部キーなどの制約を設定してください
              </p>
            </div>
            <div className="sm:pl-11">
              <CreateRestrictions
                columns={columns}
                restrictions={restrictions}
                restrictionsError={restrictionsError}
                setRestrictions={setRestrictions}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 生成ボタン */}
      <div className="flex justify-center">
        <Button onClick={handleGenerate} size="lg">
          SQL文を生成
        </Button>
      </div>

      {/* 結果表示 */}
      {statement && (
        <div>
          <Card>
            <div className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-bg-success text-fg-success flex size-6 items-center justify-center rounded-full sm:h-8 sm:w-8">
                    <span className="text-xs sm:text-sm">✓</span>
                  </div>
                  <h3 className="text-base font-bold sm:text-lg">
                    生成されたSQL
                  </h3>
                </div>
                <IconButton
                  label={isCopied ? 'コピー済み' : 'コピー'}
                  onClick={() => {
                    void handleCopy();
                  }}
                  size="sm"
                >
                  <CopyIcon />
                </IconButton>
              </div>
              <div className="bg-bg-mute overflow-x-auto rounded-lg">
                <pre className="p-3 sm:p-4">
                  <code className="text-fg-base font-mono text-xs sm:text-sm">
                    {statement}
                  </code>
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
