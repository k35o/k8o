import type { TalkInput } from '../infrastructure/talk-repository';

type ParseResult = { ok: true; data: TalkInput } | { ok: false; error: string };

// eventDate は orderBy(desc(eventDate)) で並べ替えに使うため、
// テキストで日付順に揃うよう YYYY-MM-DD 形式に限定する。
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

const getStringField = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

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
  if (!DATE_PATTERN.test(eventDate)) {
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
