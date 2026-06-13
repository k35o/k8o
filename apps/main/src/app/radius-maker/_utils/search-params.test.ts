import { radiusMakerParsers } from './search-params';

const { parse, serialize } = radiusMakerParsers.corners;

describe('cornersParser', () => {
  it('カンマ区切りの8値をRadiusCornersに変換する', () => {
    expect(parse('10,20,30,40,50,60,70,80')).toEqual({
      topLeft: { x: 10, y: 20 },
      topRight: { x: 30, y: 40 },
      bottomRight: { x: 50, y: 60 },
      bottomLeft: { x: 70, y: 80 },
    });
  });

  it('値の個数が8でない場合はnullを返す', () => {
    expect(parse('10,20,30')).toBeNull();
    expect(parse('10,20,30,40,50,60,70,80,90')).toBeNull();
  });

  it('範囲外や数値でない値が含まれる場合はnullを返す', () => {
    expect(parse('10,20,30,40,50,60,70,101')).toBeNull();
    expect(parse('10,20,30,40,50,60,70,-1')).toBeNull();
    expect(parse('10,20,30,40,50,60,70,abc')).toBeNull();
    expect(parse('10,20,30,40,50,60,70,8.5')).toBeNull();
  });

  it('serializeと往復できる', () => {
    const query = '10,20,30,40,50,60,70,80';
    const corners = {
      topLeft: { x: 10, y: 20 },
      topRight: { x: 30, y: 40 },
      bottomRight: { x: 50, y: 60 },
      bottomLeft: { x: 70, y: 80 },
    };
    expect(serialize(corners)).toBe(query);
    expect(parse(query)).toEqual(corners);
  });
});
