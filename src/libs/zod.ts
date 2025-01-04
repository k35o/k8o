import { formatDate } from '@/utils/date/format';
import {
  ZodErrorMap,
  ZodIssueCode,
  ZodParsedType,
  util,
  z,
} from 'zod';

const errorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = '必須';
      } else {
        message = `期待値：${issue.expected}、受け取った値：${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `無効なリテラル値、期待値：${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer,
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `オブジェクト内で認識されないキー：${util.joinValues(
        issue.keys,
        ', ',
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `無効な入力`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `無効なディスクリミネータ値。期待値：${util.joinValues(
        issue.options,
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `無効な列挙値。期待値：${util.joinValues(
        issue.options,
      )}、受け取った値：'${issue.received.toString()}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `無効な関数引数`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `無効な関数の戻り値の型`;
      break;
    case ZodIssueCode.invalid_date:
      message = `無効な日付`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === 'object') {
        if ('includes' in issue.validation) {
          message = `無効な入力："${issue.validation.includes}"を含む必要があります`;

          if (typeof issue.validation.position === 'number') {
            message = `${message}：位置${issue.validation.position.toString()}以上で一つ以上`;
          }
        } else if ('startsWith' in issue.validation) {
          message = `無効な入力："${issue.validation.startsWith}"で始まる必要があります`;
        } else if ('endsWith' in issue.validation) {
          message = `無効な入力："${issue.validation.endsWith}"で終わる必要があります`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== 'regex') {
        message = `無効な${issue.validation}`;
      } else {
        message = '無効';
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === 'array')
        message = issue.exact
          ? `配列はちょうど${issue.minimum.toString()}要素にしてください`
          : `配列は${issue.minimum.toString()}要素${issue.inclusive ? '以上に' : 'より大きく'}してください`;
      else if (issue.type === 'string')
        message = issue.exact
          ? `文字列はちょうど${issue.minimum.toString()}文字にしてください`
          : `文字列は${issue.minimum.toString()}文字${issue.inclusive ? '以上に' : 'より大きく'}してください`;
      else if (issue.type === 'number')
        message = issue.exact
          ? `数値はちょうど${issue.minimum.toString()}にしてください`
          : `数値は${issue.minimum.toString()}${issue.inclusive ? '以上に' : 'より大きく'}してください`;
      else if (issue.type === 'date')
        message = issue.exact
          ? `日付はちょうど${formatDate(new Date(Number(issue.minimum)))}にしてください`
          : `日付は${formatDate(new Date(Number(issue.minimum)))}${issue.inclusive ? '以上に' : 'より大きく'}してください`;
      else message = '無効な入力';
      break;
    case ZodIssueCode.too_big:
      if (issue.type === 'array')
        message = issue.exact
          ? `配列はちょうど${issue.maximum.toString()}要素にしてください`
          : `配列は${issue.maximum.toString()}文字${issue.inclusive ? '以下' : '未満'}にしてください`;
      else if (issue.type === 'string')
        message = issue.exact
          ? `文字列はちょうど${issue.maximum.toString()}文字にしてください`
          : `文字列は${issue.maximum.toString()}文字${issue.inclusive ? '以下' : '未満'}にしてください`;
      else if (issue.type === 'number')
        message = issue.exact
          ? `数値はちょうど${issue.maximum.toString()}にしてください`
          : `数値は${issue.maximum.toString()}${issue.inclusive ? '以下' : '未満'}にしてください`;
      else if (issue.type === 'bigint')
        message = issue.exact
          ? `数値はちょうど${issue.maximum.toString()}にしてください`
          : `数値は${formatDate(new Date(Number(issue.maximum)))}${issue.inclusive ? '以下' : '未満'}にしてください`;
      else if (issue.type === 'date')
        message = issue.exact
          ? `日付はちょうど${issue.maximum.toString()}にしてください`
          : `日付は${formatDate(new Date(Number(issue.maximum)))}${issue.inclusive ? '以下' : '未満'}にしてください`;
      else message = '無効な入力';
      break;
    case ZodIssueCode.custom:
      message = `無効な入力`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `交差型の結果をマージできませんでした`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `数値は${issue.multipleOf.toString()}の倍数である必要があります`;
      break;
    case ZodIssueCode.not_finite:
      message = '数値は有限である必要があります';
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

z.setErrorMap(errorMap);
