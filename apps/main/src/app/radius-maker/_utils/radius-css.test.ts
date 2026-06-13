import type { RadiusCorners } from '../_types/corner-radius';
import { cornersEqual, toBorderRadiusValue, toCssText } from './radius-css';

const corners = (
  values: [number, number, number, number, number, number, number, number],
): RadiusCorners => ({
  topLeft: { x: values[0], y: values[4] },
  topRight: { x: values[1], y: values[5] },
  bottomRight: { x: values[2], y: values[6] },
  bottomLeft: { x: values[3], y: values[7] },
});

describe('toBorderRadiusValue', () => {
  it('8値がすべて異なる場合はスラッシュ区切りの8値を返す', () => {
    expect(toBorderRadiusValue(corners([10, 20, 30, 40, 50, 60, 70, 80]))).toBe(
      '10% 20% 30% 40% / 50% 60% 70% 80%',
    );
  });

  it('全値が同じ場合は1値に簡約する', () => {
    expect(toBorderRadiusValue(corners([50, 50, 50, 50, 50, 50, 50, 50]))).toBe(
      '50%',
    );
  });

  it('対角が同じ場合は2値に簡約する', () => {
    expect(toBorderRadiusValue(corners([10, 20, 10, 20, 10, 20, 10, 20]))).toBe(
      '10% 20%',
    );
  });

  it('右上と左下が同じ場合は3値に簡約する', () => {
    expect(toBorderRadiusValue(corners([10, 20, 30, 20, 10, 20, 30, 20]))).toBe(
      '10% 20% 30%',
    );
  });

  it('水平と垂直で簡約結果が異なる場合はスラッシュを残す', () => {
    expect(toBorderRadiusValue(corners([50, 50, 50, 50, 60, 60, 40, 40]))).toBe(
      '50% / 60% 60% 40% 40%',
    );
  });

  it('水平のみ簡約できる場合も正しく組み合わせる', () => {
    expect(toBorderRadiusValue(corners([30, 70, 70, 30, 30, 30, 70, 70]))).toBe(
      '30% 70% 70% 30% / 30% 30% 70% 70%',
    );
  });
});

describe('toCssText', () => {
  it('roundのときはborder-radiusのみ出力する', () => {
    expect(toCssText(corners([50, 50, 50, 50, 50, 50, 50, 50]), 'round')).toBe(
      'border-radius: 50%;',
    );
  });

  it('round以外のときはcorner-shapeも出力する', () => {
    expect(
      toCssText(corners([50, 50, 50, 50, 50, 50, 50, 50]), 'squircle'),
    ).toBe('border-radius: 50%;\ncorner-shape: squircle;');
  });
});

describe('cornersEqual', () => {
  it('全値が一致する場合はtrueを返す', () => {
    expect(
      cornersEqual(
        corners([10, 20, 30, 40, 50, 60, 70, 80]),
        corners([10, 20, 30, 40, 50, 60, 70, 80]),
      ),
    ).toBe(true);
  });

  it('1値でも異なる場合はfalseを返す', () => {
    expect(
      cornersEqual(
        corners([10, 20, 30, 40, 50, 60, 70, 80]),
        corners([10, 20, 30, 40, 50, 60, 70, 81]),
      ),
    ).toBe(false);
  });
});
