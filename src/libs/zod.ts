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
      )}、受け取った値：'${issue.received}'`;
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
            message = `${message}：位置${issue.validation.position}以上で一つ以上`;
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
        message = `配列は${
          issue.exact
            ? 'ちょうど'
            : issue.inclusive
              ? `少なくとも`
              : `以上`
        }${issue.minimum}要素を含む必要があります`;
      else if (issue.type === 'string')
        message = `文字列は${
          issue.exact
            ? 'ちょうど'
            : issue.inclusive
              ? `少なくとも`
              : `以上`
        }${issue.minimum}文字を含む必要があります`;
      else if (issue.type === 'number')
        message = `数値は${
          issue.exact
            ? `ちょうど`
            : issue.inclusive
              ? `以上`
              : `より大きい`
        }${issue.minimum}である必要があります`;
      else if (issue.type === 'date')
        message = `日付は${
          issue.exact
            ? `ちょうど`
            : issue.inclusive
              ? `以上`
              : `より大きい`
        }${new Date(Number(issue.minimum))}である必要があります`;
      else message = '無効な入力';
      break;
    case ZodIssueCode.too_big:
      if (issue.type === 'array')
        message = `配列は${
          issue.exact ? `ちょうど` : issue.inclusive ? `以下` : `未満`
        }${issue.maximum}要素を含む必要があります`;
      else if (issue.type === 'string')
        message = `文字列は${
          issue.exact ? `ちょうど` : issue.inclusive ? `以下` : `未満`
        }${issue.maximum}文字を含む必要があります`;
      else if (issue.type === 'number')
        message = `数値は${
          issue.exact ? `ちょうど` : issue.inclusive ? `以下` : `未満`
        }${issue.maximum}である必要があります`;
      else if (issue.type === 'bigint')
        message = `BigIntは${
          issue.exact ? `ちょうど` : issue.inclusive ? `以下` : `未満`
        }${issue.maximum} である必要があります`;
      else if (issue.type === 'date')
        message = `日付は${
          issue.exact ? `ちょうど` : issue.inclusive ? `以下` : `未満`
        }${new Date(Number(issue.maximum))}である必要があります`;
      else message = '無効な入力';
      break;
    case ZodIssueCode.custom:
      message = `無効な入力`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `交差型の結果をマージできませんでした`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `数値は${issue.multipleOf}の倍数である必要があります`;
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
