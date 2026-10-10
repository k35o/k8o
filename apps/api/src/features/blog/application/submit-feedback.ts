import { insertBlogFeedback } from '../infrastructure/feedback-repository';
import { findPublishedBlogId } from '../infrastructure/view-repository';

export type SubmitFeedbackResult = 'submitted' | 'not_found';

export async function submitBlogFeedback(
  slug: string,
  { feedbackId, comment }: { feedbackId: number | null; comment: string },
): Promise<SubmitFeedbackResult> {
  const blogId = await findPublishedBlogId(slug);
  if (blogId === null) {
    return 'not_found';
  }
  await insertBlogFeedback({
    blogId,
    feedbackId,
    message: comment === '' ? null : comment,
  });
  return 'submitted';
}
