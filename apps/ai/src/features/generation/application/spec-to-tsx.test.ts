import type { Spec } from '@json-render/core';
import * as ui from '@k8ordo/ui';
import { catalog } from '@k8ordo/ui/json-render';
import { registry } from '@k8ordo/ui/json-render/registry';
import type { ReactElement } from 'react';

import {
  CARD_PADDING,
  CONVERTED_PROPS,
  EXCLUDED_PROPS,
  FIELD_TYPE_INPUTS,
  ICON_COMPONENTS,
  specToTsx,
} from './spec-to-tsx';

// registry の描画関数をそのまま呼び、実際に描かれる要素を取り出す。手書きの
// 対応表を registry のソースの写しではなく描画結果と突き合わせるため。
// registry の値は ComponentType なので TS からは直接呼べず、実体が関数である
// ことに寄せてキャストしている。Icon / Card は element しか見ない。
const renderWidget = (
  type: string,
  props: Record<string, unknown>,
): ReactElement => {
  const render = registry[type] as unknown as
    | ((args: {
        element: { type: string; props: Record<string, unknown> };
      }) => ReactElement)
    | undefined;
  if (render === undefined) {
    throw new Error(`registry に ${type} が無い`);
  }
  return render({ element: { type, props } });
};

const exportedComponents: Record<string, unknown> = ui;

const renderedIconComponent = (iconName: string): unknown =>
  renderWidget('Icon', { name: iconName }).type;

// registry の Card は children を padding つきの div で包む。その className が
// CARD_PADDING の正の側になる。
const renderedCardPadding = (size: string): unknown => {
  const inner = renderWidget('Card', { size }).props as {
    children: ReactElement;
  };
  return (inner.children.props as { className: string }).className;
};

// catalog のコンポーネント名 → prop 名。手書きの対応表と突き合わせる正の側。
const CATALOG_PROP_KEYS: Record<string, readonly string[]> = Object.fromEntries(
  Object.entries(catalog.data.components).map(([name, component]) => [
    name,
    Object.keys(component.props.shape),
  ]),
);

const convertedProps: Record<string, readonly string[]> = CONVERTED_PROPS;
const excludedProps: Record<string, readonly string[]> = EXCLUDED_PROPS;

const convertedCases = Object.keys(convertedProps).map((name) => ({
  name,
  catalogKeys: CATALOG_PROP_KEYS[name] ?? [],
  converted: convertedProps[name] ?? [],
  declared: new Set([
    ...(convertedProps[name] ?? []),
    ...(excludedProps[name] ?? []),
  ]),
}));

const excludedCases = Object.keys(excludedProps).map((name) => ({
  name,
  catalogKeys: CATALOG_PROP_KEYS[name] ?? [],
  converted: convertedProps[name] ?? [],
  excluded: excludedProps[name] ?? [],
}));

const unknownConvertedComponents = Object.keys(convertedProps).filter(
  (name) => !(name in CATALOG_PROP_KEYS),
);

const orphanExcludedComponents = Object.keys(excludedProps).filter(
  (name) => !(name in convertedProps),
);

describe('specToTsx', () => {
  describe('正常系', () => {
    it('Stack / Card / Heading / FormControl / Button を実 API の TSX へ変換する', () => {
      const spec: Spec = {
        root: 'page',
        elements: {
          page: {
            type: 'Stack',
            props: { direction: 'column', gap: 'lg' },
            children: ['title', 'card'],
          },
          title: {
            type: 'Heading',
            props: { level: 'h2', label: 'お問い合わせ' },
          },
          card: {
            type: 'Card',
            props: { variant: 'shadow', size: 'lg' },
            children: ['name', 'submit'],
          },
          name: {
            type: 'FormControl',
            props: { label: 'お名前', name: 'name', required: true },
          },
          submit: {
            type: 'Button',
            props: { label: '送信する', color: 'primary', variant: 'solid' },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx)
        .toBe(`import { Button, Card, FormControl, Heading, Stack, TextField } from '@k8ordo/ui';

export default function Preview() {
  return (
    <Stack direction="column" gap="lg">
      <Heading level="h2">お問い合わせ</Heading>
      <Card variant="shadow">
        <div className="p-8">
          <FormControl label="お名前" required
            renderInput={(props) => (
              <TextField {...props} name="name" />
            )}
          />
          <Button color="primary" variant="solid">送信する</Button>
        </div>
      </Card>
    </Stack>
  );
}
`);
    });

    it('href 付き Button は renderItem のリンクとして展開する', () => {
      const spec: Spec = {
        root: 'b',
        elements: {
          b: {
            type: 'Button',
            props: { label: '詳細を見る', href: 'https://k8o.me' },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('renderItem={({ className, children }) => (');
      expect(tsx).toContain('<a className={className} href="https://k8o.me">');
    });

    it('グループ入力はラベルの span と aria-labelledby を伴って展開する', () => {
      const spec: Spec = {
        root: 'g',
        elements: {
          g: {
            type: 'CheckboxGroup',
            props: {
              name: 'interests',
              label: '興味のある分野',
              options: [
                { value: 'css', label: 'CSS' },
                { value: 'a11y', label: 'アクセシビリティ' },
              ],
            },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('id="interests-label">興味のある分野</span>');
      expect(tsx).toContain(
        '<CheckboxGroup.Root aria-labelledby="interests-label" name="interests">',
      );
      expect(tsx).toContain(
        '<CheckboxGroup.Item itemValue="css" label="CSS" />',
      );
    });

    it('Icon は実在するアイコンコンポーネントへ対応させて import する', () => {
      const spec: Spec = {
        root: 'i',
        elements: {
          i: { type: 'Icon', props: { name: 'external-link', size: 'sm' } },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('<ExternalLinkIcon size="sm" />');
      expect(tsx).toContain("import { ExternalLinkIcon } from '@k8ordo/ui';");
    });

    it('Textarea は rows / autoResize も属性へ変換する', () => {
      const spec: Spec = {
        root: 't',
        elements: {
          t: {
            type: 'Textarea',
            props: { name: 'body', rows: 6, autoResize: true },
          },
        },
      };
      expect(specToTsx(spec)).toContain(
        '<Textarea name="body" rows={6} autoResize />',
      );
    });

    it('Switch は invalid / required も属性へ変換する', () => {
      const spec: Spec = {
        root: 's',
        elements: {
          s: {
            type: 'Switch',
            props: { name: 'agree', label: '同意する', required: true },
          },
        },
      };
      expect(specToTsx(spec)).toContain(
        '<Switch label="同意する" name="agree" required />',
      );
    });

    it('ListBox は Root / Trigger / Content の組み立てへ展開する', () => {
      const spec: Spec = {
        root: 'l',
        elements: {
          l: {
            type: 'ListBox',
            props: {
              name: 'fruit',
              label: '果物',
              options: [{ value: 'apple', label: 'りんご' }],
              defaultValue: 'apple',
            },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain(
        '<ListBox.Root options={[{"value":"apple","label":"りんご"}]} defaultValue="apple">',
      );
      expect(tsx).toContain('<ListBox.Trigger label="果物" />');
      expect(tsx).toContain('<ListBox.Content />');
    });

    it('Form は action を属性へ変換する', () => {
      const spec: Spec = {
        root: 'f',
        elements: {
          f: { type: 'Form', props: { action: '/subscribe' }, children: ['b'] },
          b: { type: 'Button', props: { label: '送信' } },
        },
      };
      expect(specToTsx(spec)).toContain('<Form action="/subscribe">');
    });
  });

  describe('異常系', () => {
    it('動的値の href を持つ Button も NOTE を残す（黙って落とさない）', () => {
      const spec: Spec = {
        root: 'b',
        elements: {
          b: {
            type: 'Button',
            props: { label: '開く', href: { $state: '/url' } },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('// NOTE: href に動的値');
      expect(tsx).toContain('<Button>開く</Button>');
    });

    it('動的値（$state）の prop は省略して NOTE を残す', () => {
      const spec: Spec = {
        root: 'h',
        elements: {
          h: {
            type: 'Heading',
            props: { label: { $state: '/title' }, level: 'h3' },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('// NOTE:');
      expect(tsx).toContain('$state');
      expect(tsx).not.toContain('$state: ');
    });

    it('catalog に無い PasswordInput の readOnly は属性へ出さない', () => {
      const spec: Spec = {
        root: 'p',
        elements: {
          p: {
            type: 'PasswordInput',
            props: { name: 'password', readOnly: true },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('<PasswordInput name="password" />');
      expect(tsx).not.toContain('readOnly');
    });

    it('未対応の複合コンポーネントは TODO コメントにして props を残す', () => {
      const spec: Spec = {
        root: 't',
        elements: {
          t: {
            type: 'Table',
            props: { columns: ['a'], rows: [['1']] },
          },
        },
      };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('{/* TODO: Table props=');
      expect(tsx).toContain('// NOTE: Table は手動で移植すること。');
    });
  });

  describe('エッジケース', () => {
    it('root が elements に無い場合も壊れず骨組みだけ出力する', () => {
      const spec: Spec = { root: 'missing', elements: {} };
      const tsx = specToTsx(spec);
      expect(tsx).toContain('export default function Preview()');
    });
  });

  // 手書きの対応表は @k8ordo/ui のバージョンアップで黙って古びるため、
  // インストール済み catalog と機械的に照合して転記漏れを検知する。
  describe('catalogとのドリフト検知', () => {
    it('ICON_COMPONENTS のキーが catalog の Icon.name と1対1で一致する', () => {
      const iconNameOptions: readonly string[] =
        catalog.data.components.Icon.props.shape.name.options;
      expect(Object.keys(ICON_COMPONENTS).toSorted()).toStrictEqual(
        [...iconNameOptions].toSorted(),
      );
    });

    it.each(Object.entries(ICON_COMPONENTS))(
      'アイコン %s の対応先 %s が registry の描画するコンポーネントと一致する',
      (iconName, componentName) => {
        expect(exportedComponents[componentName]).toBe(
          renderedIconComponent(iconName),
        );
      },
    );

    it('CARD_PADDING のキーが catalog の Card.size と1対1で一致する', () => {
      const sizeOptions: readonly string[] =
        catalog.data.components.Card.props.shape.size.unwrap().options;
      expect(Object.keys(CARD_PADDING).toSorted()).toStrictEqual(
        [...sizeOptions].toSorted(),
      );
    });

    it.each(Object.entries(CARD_PADDING))(
      'Card の size %s のパディング %s が registry の描画と一致する',
      (size, padding) => {
        expect(renderedCardPadding(size)).toBe(padding);
      },
    );

    it('FIELD_TYPE_INPUTS のキーが catalog の FormControl.fieldType と1対1で一致する', () => {
      const fieldTypeOptions: readonly string[] =
        catalog.data.components.FormControl.props.shape.fieldType.unwrap()
          .options;
      expect(Object.keys(FIELD_TYPE_INPUTS).toSorted()).toStrictEqual(
        [...fieldTypeOptions].toSorted(),
      );
    });

    it.each(Object.values(FIELD_TYPE_INPUTS))(
      'FIELD_TYPE_INPUTS の対応先 %s が @k8ordo/ui の export として実在する',
      (componentName) => {
        expect(exportedComponents[componentName]).toBeDefined();
      },
    );

    it('CONVERTED_PROPS のキーが catalog に実在するコンポーネントである', () => {
      expect(unknownConvertedComponents).toStrictEqual([]);
    });

    it('EXCLUDED_PROPS のキーが変換対象のコンポーネントに閉じている', () => {
      expect(orphanExcludedComponents).toStrictEqual([]);
    });

    it.each(convertedCases)(
      '$name の変換対象 prop が catalog の prop に収まる（catalog に無い prop を出さない）',
      ({ converted, catalogKeys }) => {
        expect(
          converted.filter((prop) => !catalogKeys.includes(prop)),
        ).toStrictEqual([]);
      },
    );

    it.each(convertedCases)(
      '$name の catalog の prop が変換対象か除外リストのどちらかに載っている',
      ({ declared, catalogKeys }) => {
        expect(catalogKeys.filter((key) => !declared.has(key))).toStrictEqual(
          [],
        );
      },
    );

    it.each(excludedCases)(
      '$name の除外リストが catalog に実在する prop だけを挙げている',
      ({ excluded, catalogKeys }) => {
        expect(
          excluded.filter((prop) => !catalogKeys.includes(prop)),
        ).toStrictEqual([]);
      },
    );

    it.each(excludedCases)(
      '$name の除外リストが変換対象と重複しない',
      ({ excluded, converted }) => {
        expect(
          excluded.filter((prop) => converted.includes(prop)),
        ).toStrictEqual([]);
      },
    );
  });
});
