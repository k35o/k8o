import type { Spec } from '@json-render/core';
import { validateGeneratedSpec } from '@k8ordo/ui/json-render';
import { describe, expect, it } from 'vitest';

import { buildSpecSystemPrompt } from './build-spec-system-prompt';

const badge = (label: string): Spec['elements'][string] => ({
  type: 'Badge',
  props: { label },
});

// 並べ方の規則が名指しする props の値を、すべて1つの spec に置く
const RECOMMENDED: Spec = {
  root: 'page',
  elements: {
    page: {
      type: 'Stack',
      props: { direction: 'column', gap: 'lg' },
      children: [
        'note',
        'plans',
        'sizes',
        'keys',
        'actions',
        'steps',
        'carousel',
        'fullCarousel',
      ],
    },
    note: { type: 'Callout', props: { tone: 'info', content: '税込みです' } },
    plans: {
      type: 'Grid',
      props: { cols: 'auto-fit', minItemSize: 48, gap: 'md' },
      children: ['free', 'pro'],
    },
    free: {
      type: 'Card',
      props: { size: 'sm', variant: 'outline' },
      children: ['features'],
    },
    features: {
      type: 'Stack',
      props: { direction: 'column', align: 'start', gap: 'sm' },
      children: ['feature1', 'feature2'],
    },
    feature1: badge('プロジェクト無制限'),
    feature2: badge('メールサポート'),
    pro: {
      type: 'Card',
      props: { size: 'md', variant: 'outline' },
      children: ['recommended'],
    },
    recommended: badge('おすすめ'),
    sizes: {
      type: 'Stack',
      props: { direction: 'column' },
      children: ['size24', 'size32', 'size40', 'size64', 'size80'],
    },
    size24: {
      type: 'Grid',
      props: { cols: 'auto-fit', minItemSize: 24 },
      children: ['label24'],
    },
    label24: badge('24'),
    size32: {
      type: 'Grid',
      props: { cols: 'auto-fit', minItemSize: 32 },
      children: ['label32'],
    },
    label32: badge('32'),
    size40: {
      type: 'Grid',
      props: { cols: 'auto-fit', minItemSize: 40 },
      children: ['label40'],
    },
    label40: badge('40'),
    size64: {
      type: 'Grid',
      props: { cols: 'auto-fit', minItemSize: 64 },
      children: ['label64'],
    },
    label64: badge('64'),
    size80: {
      type: 'Grid',
      props: { cols: 'auto-fit', minItemSize: 80 },
      children: ['label80'],
    },
    label80: badge('80'),
    keys: {
      type: 'Grid',
      props: { cols: 4, gap: 'sm' },
      children: ['seven', 'eight'],
    },
    seven: { type: 'Button', props: { label: '7' } },
    eight: { type: 'Button', props: { label: '8' } },
    actions: {
      type: 'Stack',
      props: { direction: 'row', gap: 'sm' },
      children: ['save', 'back'],
    },
    save: { type: 'Button', props: { label: '保存' } },
    back: { type: 'Button', props: { label: '戻る' } },
    steps: {
      type: 'Stepper',
      props: {
        label: '手順',
        steps: [{ label: '入力' }, { label: '確認' }],
        current: 0,
        orientation: 'vertical',
      },
    },
    carousel: {
      type: 'Carousel',
      props: { label: '写真', slideSize: 'lg' },
      children: ['slide'],
    },
    slide: badge('1枚目'),
    fullCarousel: {
      type: 'Carousel',
      props: { label: '大きな写真', slideSize: 'full' },
      children: ['fullSlide'],
    },
    fullSlide: badge('1枚目'),
  },
};

describe('buildSpecSystemPrompt', () => {
  describe('正常系', () => {
    it('描く枠の幅と、横に並べるときは Grid を auto-fit で組む規則を含む', () => {
      const prompt = buildSpecSystemPrompt();
      expect(prompt).toContain('960px');
      expect(prompt).toContain('cols を "auto-fit"');
    });

    // @k8ordo/ui を上げて props の値が変わったとき、規則の文が古くなったことに気づくため
    it('規則が勧める部品の指定は、catalog の検証を通る', () => {
      expect(validateGeneratedSpec(RECOMMENDED)).toMatchObject({ ok: true });
    });
  });
});
