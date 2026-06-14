import { streamUiBuilder } from '../infrastructure/generate';
import { handleUiBuilderChat } from './chat';

// 認証と AI 呼び出しはモックし、interface の検証・認可ロジックだけを試す。
const h = vi.hoisted(() => ({
  authEnabled: false,
  session: null as unknown,
}));

vi.mock('@/shared/auth/auth-enabled', () => ({
  get isAuthEnabled() {
    return h.authEnabled;
  },
}));

vi.mock('@repo/database/auth', () => ({
  auth: { api: { getSession: vi.fn(() => h.session) } },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

vi.mock('../infrastructure/generate', () => ({
  streamUiBuilder: vi.fn(() => new Response('stream', { status: 200 })),
}));

const post = (body: unknown): Request =>
  new Request('http://localhost/api/ui-builder', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

describe('handleUiBuilderChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.authEnabled = false;
    h.session = null;
  });

  describe('正常系', () => {
    it('有効なメッセージで streamUiBuilder を呼び、その Response を返す', async () => {
      const res = await handleUiBuilderChat(
        post({ messages: [{ role: 'user', content: 'ログインフォーム' }] }),
      );

      expect(res.status).toBe(200);
      expect(streamUiBuilder).toHaveBeenCalledWith([
        { role: 'user', content: 'ログインフォーム' },
      ]);
    });
  });

  describe('認可', () => {
    it('認証が有効でセッションが無ければ401を返し、生成は呼ばれない', async () => {
      h.authEnabled = true;
      h.session = null;

      const res = await handleUiBuilderChat(
        post({ messages: [{ role: 'user', content: 'x' }] }),
      );

      expect(res.status).toBe(401);
      expect(streamUiBuilder).not.toHaveBeenCalled();
    });

    it('認証が有効でもセッションがあれば生成する', async () => {
      h.authEnabled = true;
      h.session = { user: { id: '1' } };

      const res = await handleUiBuilderChat(
        post({ messages: [{ role: 'user', content: 'x' }] }),
      );

      expect(res.status).toBe(200);
      expect(streamUiBuilder).toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('不正なJSONは400を返し、生成は呼ばれない', async () => {
      const res = await handleUiBuilderChat(post('{ not json'));

      expect(res.status).toBe(400);
      expect(streamUiBuilder).not.toHaveBeenCalled();
    });

    it('messages が無ければ400', async () => {
      const res = await handleUiBuilderChat(post({ foo: 'bar' }));

      expect(res.status).toBe(400);
    });

    it('空の messages は400', async () => {
      const res = await handleUiBuilderChat(post({ messages: [] }));

      expect(res.status).toBe(400);
    });

    it('role が user / assistant 以外なら400', async () => {
      const res = await handleUiBuilderChat(
        post({ messages: [{ role: 'system', content: 'x' }] }),
      );

      expect(res.status).toBe(400);
    });

    it('content が長すぎると400', async () => {
      const res = await handleUiBuilderChat(
        post({ messages: [{ role: 'user', content: 'a'.repeat(8001) }] }),
      );

      expect(res.status).toBe(400);
    });
  });
});
