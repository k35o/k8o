import { db } from '@repo/database';
import { getQuizType } from '../quiz-type';

vi.mock('@/database/db', () => ({
  db: {
    query: {
      quizType: {
        findFirst: vi.fn(),
      },
    },
  },
}));

describe('quiz-type', () => {
  it('クイズの種別を取得できる', async () => {
    const mockFirst = vi.fn().mockResolvedValue({
      id: 1,
      name: 'General Knowledge',
    });
    vi.mocked(db.query.quizType.findFirst).mockImplementation(mockFirst);

    const quizzes = await getQuizType({
      type: 1,
    });
    expect(quizzes).toBeDefined();
    expect(quizzes?.id).toBe(1);
    expect(quizzes?.name).toBe('General Knowledge');
  });
});
