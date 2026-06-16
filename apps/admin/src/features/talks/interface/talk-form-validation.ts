import { isYmdDate } from '@repo/helpers/date/is-ymd-date';
import { getStringField } from '@repo/helpers/form/get-string-field';

import type { TalkInput } from '../infrastructure/talk-repository';

type ParseResult = { ok: true; data: TalkInput } | { ok: false; error: string };

export const parseTalkFormData = (formData: FormData): ParseResult => {
  const title = getStringField(formData, 'title');
  const eventName = getStringField(formData, 'eventName');
  const eventDate = getStringField(formData, 'eventDate');
  const eventLocation = getStringField(formData, 'eventLocation');
  const eventUrl = getStringField(formData, 'eventUrl');
  const slideUrl = getStringField(formData, 'slideUrl');
  const blogId = Number(getStringField(formData, 'blogId'));

  if (!(title && eventName && eventDate && eventUrl && slideUrl)) {
    return {
      ok: false,
      error: 'タイトル・イベント名・日付・イベントURL・スライドURLは必須です',
    };
  }
  if (!isYmdDate(eventDate)) {
    return { ok: false, error: '開催日は YYYY-MM-DD 形式で入力してください' };
  }
  if (!Number.isInteger(blogId) || blogId <= 0) {
    return { ok: false, error: '紐づけるブログを選択してください' };
  }
  if (!URL.canParse(eventUrl) || !URL.canParse(slideUrl)) {
    return { ok: false, error: '有効なURLを入力してください' };
  }

  return {
    ok: true,
    data: {
      title,
      eventName,
      eventDate,
      eventLocation: eventLocation === '' ? null : eventLocation,
      eventUrl,
      slideUrl,
      blogId,
    },
  };
};
