// Drizzle(SQLite) のスキーマを import して getTableConfig() で読み取り、
// Mermaid erDiagram を生成して README.md の ERD マーカー間に書き込む。

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getTableConfig } from 'drizzle-orm/sqlite-core';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';

import { schema } from '../src/schema/index';

const README_FILE = join(import.meta.dirname, '..', 'README.md');
const MARKER_START = '<!-- ERD:START -->';
const MARKER_END = '<!-- ERD:END -->';

type Relation = {
  readonly parent: string;
  readonly child: string;
  readonly label: string;
  readonly mandatory: boolean;
};

const ident = (value: string): string =>
  value.replaceAll(/[^A-Za-z0-9_]/gu, '_');

// "text(255)" 等は括弧前のベース型だけ使う
const baseType = (sqlType: string): string =>
  ident(sqlType.replace(/\(.*\)$/u, '').trim()) || 'unknown';

const tableConfigs = Object.values(schema).map((table) =>
  getTableConfig(table as SQLiteTable),
);

const renderTable = (config: ReturnType<typeof getTableConfig>): string => {
  const compositePkCols = new Set(
    config.primaryKeys.flatMap((pk) => pk.columns.map((c) => c.name)),
  );
  const fkCols = new Set(
    config.foreignKeys.flatMap((fk) =>
      fk.reference().columns.map((c) => c.name),
    ),
  );
  const uniqueCols = new Set<string>();
  for (const idx of config.indexes) {
    if (idx.config.unique && idx.config.columns.length === 1) {
      const col = idx.config.columns[0];
      if (col !== undefined && 'name' in col) uniqueCols.add(col.name);
    }
  }
  for (const uc of config.uniqueConstraints) {
    if (uc.columns.length === 1) {
      const col = uc.columns[0];
      if (col !== undefined) uniqueCols.add(col.name);
    }
  }

  const lines = config.columns.map((col) => {
    const keys: string[] = [];
    if (col.primary || compositePkCols.has(col.name)) keys.push('PK');
    if (fkCols.has(col.name)) keys.push('FK');
    if (!col.primary && (col.isUnique || uniqueCols.has(col.name))) {
      keys.push('UK');
    }
    const suffix = keys.length > 0 ? ` ${keys.join(',')}` : '';
    return `    ${baseType(col.getSQLType())} ${ident(col.name)}${suffix}`;
  });

  return `  ${ident(config.name)} {\n${lines.join('\n')}\n  }`;
};

const collectRelations = (): Relation[] => {
  const relations: Relation[] = [];
  for (const config of tableConfigs) {
    for (const fk of config.foreignKeys) {
      const ref = fk.reference();
      const parent = getTableConfig(ref.foreignTable).name;
      const cols = ref.columns.map((c) => c.name);
      relations.push({
        parent: ident(parent),
        child: ident(config.name),
        label: cols.join(', '),
        mandatory: ref.columns.every((c) => c.notNull),
      });
    }
  }
  return relations.toSorted((a, b) =>
    `${a.parent}${a.child}${a.label}`.localeCompare(
      `${b.parent}${b.child}${b.label}`,
    ),
  );
};

const renderRelation = (rel: Relation): string => {
  // 子から見た親側: 必須=|| / 任意=|o 。親から見た子側は 0..多 = o{ 。
  const left = rel.mandatory ? '||' : '|o';
  return `  ${rel.parent} ${left}--o{ ${rel.child} : "${rel.label}"`;
};

const tables = [...tableConfigs]
  .toSorted((a, b) => a.name.localeCompare(b.name))
  .map((config) => renderTable(config))
  .join('\n');
const relationList = collectRelations();
const relations = relationList
  .map((relation) => renderRelation(relation))
  .join('\n');

const mermaid = `erDiagram\n${tables}\n${relations}`;

const block = `${MARKER_START}
<!-- 自動生成: \`pnpm build:erd\` で再生成。手で編集しない。 -->

\`\`\`mermaid
${mermaid}
\`\`\`
${MARKER_END}`;

const readme = readFileSync(README_FILE, 'utf8');
const start = readme.indexOf(MARKER_START);
const end = readme.indexOf(MARKER_END);
if (start === -1 || end === -1 || end < start) {
  throw new Error(
    `README.md に ${MARKER_START} / ${MARKER_END} マーカーが見つからない`,
  );
}
const updated =
  readme.slice(0, start) + block + readme.slice(end + MARKER_END.length);
writeFileSync(README_FILE, updated);
console.error(
  `>> README.md updated (${tableConfigs.length} tables, ${relationList.length} relations)`,
);
