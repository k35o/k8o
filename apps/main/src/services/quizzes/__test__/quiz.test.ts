import { db } from '@repo/database';
import { getQuizzes } from '../quiz';

vi.mock('@/database/db', () => ({
  db: {
    query: {
      quizzes: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('quiz', () => {
  it('クイズの一覧を取得できる', async () => {
    const mockMany = vi.fn().mockResolvedValue([
      {
        id: 1,
        type: 1,
        question: {
          id: 1,
          quizId: 1,
          highlight: 'Highlight text',
          question: 'What is the capital of France?',
        },
        answers: [
          {
            id: 1,
            quizId: 1,
            answer: 'Paris',
            explanation: 'Paris is the capital of France.',
          },
        ],
      },
    ]);
    vi.mocked(db.query.quizzes.findMany).mockImplementation(mockMany);

    const quizzes = await getQuizzes({
      type: 1,
    });

    expect(quizzes).toHaveLength(1);
    expect(quizzes[0]?.id).toBe(1);
    expect(quizzes[0]?.question).toBe('What is the capital of France?');
    expect(quizzes[0]?.highlight).toBe('Highlight text');
    expect(quizzes[0]?.answers).toHaveLength(1);
    expect(quizzes[0]?.answers[0]?.answer).toBe('Paris');
    expect(quizzes[0]?.answers[0]?.explanation).toBe(
      'Paris is the capital of France.',
    );
    expect(mockMany).toHaveBeenCalledOnce();
  });
});
