import { describe, expect, it } from 'vitest';

import { getJetBrainsMonoFont } from './get-jetbrains-mono-font';
import { getMPlus2Font } from './get-m-plus-2-font';

const TRUETYPE_SFNT_VERSION = 0x00_01_00_00;

const readSfnt = (
  font: Buffer,
): { sfntVersion: number; tables: string[]; weight: number | undefined } => {
  const offsets = new Map<string, number>();
  const numTables = font.readUInt16BE(4);
  for (let index = 0; index < numTables; index += 1) {
    const record = 12 + index * 16;
    offsets.set(
      font.toString('latin1', record, record + 4),
      font.readUInt32BE(record + 8),
    );
  }
  const os2 = offsets.get('OS/2');

  return {
    sfntVersion: font.readUInt32BE(0),
    tables: [...offsets.keys()],
    weight: os2 === undefined ? undefined : font.readUInt16BE(os2 + 4),
  };
};

describe('getMPlus2Font', () => {
  describe('正常系', () => {
    it('可変軸を持たない TrueType の、太さ 400 のフォントを返す', () => {
      const font = readSfnt(getMPlus2Font());

      expect(font.sfntVersion).toBe(TRUETYPE_SFNT_VERSION);
      expect(font.tables).not.toContain('fvar');
      expect(font.weight).toBe(400);
    });
  });
});

describe('getJetBrainsMonoFont', () => {
  describe('正常系', () => {
    it('可変軸を持たない TrueType の、太さ 400 のフォントを返す', () => {
      const font = readSfnt(getJetBrainsMonoFont());

      expect(font.sfntVersion).toBe(TRUETYPE_SFNT_VERSION);
      expect(font.tables).not.toContain('fvar');
      expect(font.weight).toBe(400);
    });
  });
});
