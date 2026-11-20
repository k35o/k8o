import { describe, expect, it } from 'vitest';

import {
  appleDocumentationDataUrl,
  extractAppleDocumentationText,
} from './apple-documentation-text';

describe('appleDocumentationDataUrl', () => {
  describe('正常系', () => {
    it('ドキュメントのページの URL を、同じ中身の JSON の URL にする', () => {
      expect(
        appleDocumentationDataUrl(
          'https://developer.apple.com/documentation/safari-release-notes/safari-27_2-release-notes',
        ),
      ).toBe(
        'https://developer.apple.com/tutorials/data/documentation/safari-release-notes/safari-27_2-release-notes.json',
      );
    });
  });

  describe('エッジケース', () => {
    it('ドキュメントのページでなければ null を返す', () => {
      expect(
        appleDocumentationDataUrl('https://developer.apple.com/news/'),
      ).toBeNull();
      expect(
        appleDocumentationDataUrl('https://webkit.org/documentation/a'),
      ).toBeNull();
    });

    it('パスにドットや ../ を含む URL を JSON の URL にしない', () => {
      expect(
        appleDocumentationDataUrl(
          'https://developer.apple.com/documentation/a/..%2F..%2Fsecret',
        ),
      ).toBeNull();
    });
  });
});

describe('extractAppleDocumentationText', () => {
  describe('正常系', () => {
    it('見出し・段落・箇条書きの字を、出てくる順につなぐ', () => {
      expect(
        extractAppleDocumentationText({
          primaryContentSections: [
            {
              kind: 'content',
              content: [
                { type: 'heading', text: 'Overview' },
                {
                  type: 'paragraph',
                  inlineContent: [
                    { type: 'text', text: 'Safari 27.2 is available for ' },
                    { type: 'codeVoice', code: 'macOS 27.2' },
                    { type: 'text', text: '.' },
                  ],
                },
                {
                  type: 'unorderedList',
                  items: [
                    {
                      content: [
                        {
                          type: 'paragraph',
                          inlineContent: [
                            { type: 'text', text: 'Fixed VoiceOver.' },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      ).toBe(
        'Overview Safari 27.2 is available for macOS 27.2 . Fixed VoiceOver.',
      );
    });
  });

  describe('異常系', () => {
    it('本文の無い JSON は空文字になる', () => {
      expect(extractAppleDocumentationText({})).toBe('');
      expect(extractAppleDocumentationText(null)).toBe('');
    });
  });
});
