import 'server-only';
import { fmt } from '@k8o/oxc-config';
import { format } from 'oxfmt';

export type OxfmtResult = Awaited<ReturnType<typeof format>>;

// format() の options (FormatConfig) には設定ファイル専用キーが無いため取り除く
const fmtOptions = { ...fmt };
delete fmtOptions.ignorePatterns;
delete fmtOptions.overrides;

export const runOxfmt = (
  code: string,
  fileName: string,
): Promise<OxfmtResult> => format(fileName, code, fmtOptions);
