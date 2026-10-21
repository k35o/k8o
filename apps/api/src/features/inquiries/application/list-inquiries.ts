import { toUntrustedText } from '../../../shared/text/untrusted-text';
import { findInquiries } from '../infrastructure/inquiry-repository';

// 投稿時の上限（お問い合わせ255字・フィードバック500字）より大きく取り、切り詰めは保険にとどめる
const MESSAGE_MAX_LENGTH = 1000;

type InquiryListItem = {
  id: number;
  receivedAt: string;
  kind: 'contact' | 'blog_feedback';
  blogSlug: string | null;
  feedbackLabel: string | null;
  untrustedMessage: string | null;
};

type InquiryList = {
  total: number;
  items: InquiryListItem[];
};

export const listInquiries = async ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}): Promise<InquiryList> => {
  const { items, total } = await findInquiries({ page, pageSize });
  return {
    total,
    items: items.map((item) => ({
      id: item.id,
      receivedAt: item.createdAt,
      kind: item.blogSlug === null ? 'contact' : 'blog_feedback',
      blogSlug: item.blogSlug,
      feedbackLabel: item.feedbackName,
      untrustedMessage:
        item.message === null
          ? null
          : toUntrustedText(item.message, MESSAGE_MAX_LENGTH),
    })),
  };
};
