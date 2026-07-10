import {
  Alert,
  Anchor,
  Badge,
  Code,
  Heading,
  Spinner,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

import type { LintDiagnostic } from '@/features/code-dock/interface/types';

type Props = {
  /** null は未検査 (コードが空) を表す */
  diagnostics: LintDiagnostic[] | null;
  isLinting: boolean;
  errorMessage: string | null;
};

const severityTone = (
  severity: LintDiagnostic['severity'],
): 'error' | 'warning' => (severity === 'warning' ? 'warning' : 'error');

const position = (diagnostic: LintDiagnostic): string | null => {
  if (diagnostic.line === null) {
    return null;
  }
  if (diagnostic.column === null) {
    return `L${diagnostic.line.toString()}`;
  }
  return `L${diagnostic.line.toString()}:${diagnostic.column.toString()}`;
};

const RuleCode: FC<{ diagnostic: LintDiagnostic }> = ({ diagnostic }) => {
  if (diagnostic.code === null) {
    return null;
  }
  if (diagnostic.url === null) {
    return <Code>{diagnostic.code}</Code>;
  }
  return (
    <Anchor href={diagnostic.url} openInNewTab>
      <span className="font-mono text-sm">{diagnostic.code}</span>
    </Anchor>
  );
};

const DiagnosticItem: FC<{ diagnostic: LintDiagnostic }> = ({ diagnostic }) => {
  const pos = position(diagnostic);
  return (
    <li className="border-border-mute flex flex-col gap-1 rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          size="sm"
          text={diagnostic.severity}
          tone={severityTone(diagnostic.severity)}
        />
        {pos === null ? null : (
          <span className="text-fg-mute font-mono text-sm">{pos}</span>
        )}
        <RuleCode diagnostic={diagnostic} />
      </div>
      <p className="text-sm">{diagnostic.message}</p>
      {diagnostic.help === null ? null : (
        <p className="text-fg-mute text-sm">{diagnostic.help}</p>
      )}
    </li>
  );
};

const diagnosticKey = (diagnostic: LintDiagnostic, index: number): string =>
  [
    diagnostic.line?.toString() ?? '',
    diagnostic.column?.toString() ?? '',
    diagnostic.code ?? '',
    index.toString(),
  ].join('-');

const ListBody: FC<Omit<Props, 'isLinting'>> = ({
  diagnostics,
  errorMessage,
}) => {
  if (errorMessage !== null) {
    return <Alert message={errorMessage} tone="error" />;
  }
  if (diagnostics === null) {
    return (
      <p className="text-fg-mute text-sm">
        コードを入力すると、自動で検査結果が表示されます。
      </p>
    );
  }
  if (diagnostics.length === 0) {
    return <Alert message="問題は見つかりませんでした" tone="success" />;
  }
  return (
    <ul className="flex flex-col gap-3">
      {diagnostics.map((diagnostic, index) => (
        <DiagnosticItem
          diagnostic={diagnostic}
          key={diagnosticKey(diagnostic, index)}
        />
      ))}
    </ul>
  );
};

export const DiagnosticList: FC<Props> = ({
  diagnostics,
  isLinting,
  errorMessage,
}) => {
  const errorCount =
    diagnostics?.filter((d) => d.severity === 'error').length ?? 0;
  const warningCount =
    diagnostics?.filter((d) => d.severity === 'warning').length ?? 0;
  const totalCount = errorCount + warningCount;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Heading type="h3">検査結果</Heading>
        {totalCount > 0 ? (
          <span className="text-fg-mute text-sm">
            {`error ${errorCount.toString()} / warning ${warningCount.toString()}`}
          </span>
        ) : null}
        {isLinting ? <Spinner label="検査中" size="sm" /> : null}
      </div>
      <ListBody diagnostics={diagnostics} errorMessage={errorMessage} />
    </section>
  );
};
