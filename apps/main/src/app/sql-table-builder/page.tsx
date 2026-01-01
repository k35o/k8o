'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Card } from '@k8o/arte-odyssey/card';
import { useClipboard } from '@k8o/arte-odyssey/hooks/clipboard';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { CopyIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
import { uuidV4 } from '@repo/helpers/uuid-v4';
import { AnimatePresence, motion } from 'motion/react';
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

// ステップインジケーターコンポーネント
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
      className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs transition-colors sm:h-8 sm:w-8 sm:text-sm ${
        isActive ? 'bg-bg-primary text-fg-onFill' : 'bg-bg-mute text-fg-mute'
      }`}
    >
      {step}
    </div>
    <h3 className="font-bold text-base sm:text-lg">{title}</h3>
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
  const [restroctionsError, setRestroctionsError] =
    useState<InvalidRestrictions['errors']>();

  const handleCopy = async () => {
    await writeClipboard(statement);
    setIsCopied(true);
    onOpen('success', 'コピーしました');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerate = () => {
    setTableError(undefined);
    setColumnsError(undefined);
    setRestroctionsError(undefined);
    setStatement('');
    const statementResult = makeStatement(table, columns, restrictions);
    if (!statementResult.isSuccessful) {
      setTableError(statementResult.invalidTable?.errors);
      setColumnsError(statementResult.invalidColumns?.errors);
      setRestroctionsError(statementResult.invalidRestrictions?.errors);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setStatement(statementResult.statement);
  };

  return (
    <motion.section
      animate={{ opacity: 1 }}
      className="grid gap-6 py-4"
      initial={{ opacity: 0 }}
      ref={topRef}
      transition={{ duration: 0.3 }}
    >
      {/* Step 1: テーブル情報 */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <div className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <StepIndicator step={1} title="テーブル情報" />
              <p className="mt-2 text-fg-mute text-sm sm:pl-11">
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
      </motion.div>

      {/* Step 2: カラム情報 */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <div className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <StepIndicator step={2} title="カラム情報" />
              <p className="mt-2 text-fg-mute text-sm sm:pl-11">
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
      </motion.div>

      {/* Step 3: 制約 */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <div className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <StepIndicator step={3} title="制約" />
              <p className="mt-2 text-fg-mute text-sm sm:pl-11">
                主キーや外部キーなどの制約を設定してください
              </p>
            </div>
            <div className="sm:pl-11">
              <CreateRestrictions
                columns={columns}
                restrictions={restrictions}
                restroctionsError={restroctionsError}
                setRestrictions={setRestrictions}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 生成ボタン */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Button onClick={handleGenerate} size="lg">
          SQL文を生成
        </Button>
      </motion.div>

      {/* 結果表示 */}
      <AnimatePresence>
        {statement && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <div className="p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-success text-fg-success sm:h-8 sm:w-8">
                      <span className="text-xs sm:text-sm">✓</span>
                    </div>
                    <h3 className="font-bold text-base sm:text-lg">
                      生成されたSQL
                    </h3>
                  </div>
                  <IconButton
                    label={isCopied ? 'コピー済み' : 'コピー'}
                    onClick={handleCopy}
                    size="sm"
                  >
                    <CopyIcon />
                  </IconButton>
                </div>
                <div className="overflow-x-auto rounded-lg bg-bg-mute">
                  <pre className="p-3 sm:p-4">
                    <code className="font-mono text-fg-base text-xs sm:text-sm">
                      {statement}
                    </code>
                  </pre>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
