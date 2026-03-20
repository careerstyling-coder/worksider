// @TASK P3-S3-T1 - Question Aggregate API tests (P3-S3 enhanced version)
// @SPEC docs/planning/02-trd.md#question-aggregate

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase mock setup ---
const { mockFrom, mockAuth } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  };
  return { mockFrom, mockAuth };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: mockAuth,
  }),
}));

import { GET } from '@/app/api/questions/[id]/aggregate/route';

function createRequest(url: string) {
  return new Request(url, { headers: { 'Content-Type': 'application/json' } });
}

const mockQuestion = {
  id: 'q-uuid-1',
  title: '팀에서 나는 어떤 역할을 선호하나요?',
  status: 'active',
  deadline: null,
  participant_count: 120,
  options: ['리더', '실무자', '조율자', '전문가'],
  created_by: null,
  suggestion_id: null,
  is_featured: false,
  type: 'simple',
  description: null,
  created_at: '2026-03-17T00:00:00Z',
};

const mockResponses = [
  { id: 'r1', question_id: 'q-uuid-1', user_id: null, selected_option: '리더', persona_label: null, created_at: '2026-03-17T00:00:00Z' },
  { id: 'r2', question_id: 'q-uuid-1', user_id: null, selected_option: '리더', persona_label: '전략적 성과자', created_at: '2026-03-17T00:00:00Z' },
  { id: 'r3', question_id: 'q-uuid-1', user_id: null, selected_option: '실무자', persona_label: '자율형 독립가', created_at: '2026-03-17T00:00:00Z' },
  { id: 'r4', question_id: 'q-uuid-1', user_id: null, selected_option: '실무자', persona_label: null, created_at: '2026-03-17T00:00:00Z' },
];

// Helper: sets up mockFrom to handle questions + question_responses + allQuestions queries
function setupMocks(overrides?: {
  questionData?: typeof mockQuestion | null;
  questionError?: object | null;
  responses?: typeof mockResponses;
  responsesError?: object | null;
}) {
  const { questionData = mockQuestion, questionError = null, responses = mockResponses, responsesError = null } = overrides ?? {};

  mockFrom.mockImplementation((table: string) => {
    if (table === 'questions') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: questionData, error: questionError }),
            order: vi.fn().mockResolvedValue({
              data: questionData ? [{ id: questionData.id, created_at: questionData.created_at }] : [],
              error: null,
            }),
          })),
        })),
      };
    }
    // question_responses
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: responses, error: responsesError }),
        })),
      })),
    };
  });
}

const mockParams = Promise.resolve({ id: 'q-uuid-1' });

describe('GET /api/questions/[id]/aggregate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('질문이 존재할 때 집계 결과를 반환한다', async () => {
    setupMocks();
    const request = createRequest('http://localhost/api/questions/q-uuid-1/aggregate');
    const response = await GET(request, { params: mockParams });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.id).toBe('q-uuid-1');
    expect(body.data.title).toBe('팀에서 나는 어떤 역할을 선호하나요?');
    expect(body.data.participant_count).toBe(120);
  });

  it('results 배열에 선택지별 count와 percentage가 포함된다', async () => {
    setupMocks();
    const request = createRequest('http://localhost/api/questions/q-uuid-1/aggregate');
    const response = await GET(request, { params: mockParams });
    const body = await response.json();

    expect(body.data.results).toBeDefined();
    expect(Array.isArray(body.data.results)).toBe(true);
    const leaderResult = body.data.results.find((r: { option: string }) => r.option === '리더');
    expect(leaderResult).toBeDefined();
    expect(leaderResult.count).toBe(2);
    expect(leaderResult.percentage).toBeGreaterThan(0);
  });

  it('persona_distribution이 포함된다', async () => {
    setupMocks();
    const request = createRequest('http://localhost/api/questions/q-uuid-1/aggregate');
    const response = await GET(request, { params: mockParams });
    const body = await response.json();

    expect(body.data.persona_distribution).toBeDefined();
    expect(Array.isArray(body.data.persona_distribution)).toBe(true);
  });

  it('질문이 없을 때 404를 반환한다', async () => {
    setupMocks({
      questionData: null,
      questionError: { code: 'PGRST116', message: 'not found' },
    });
    const request = createRequest('http://localhost/api/questions/nonexistent/aggregate');
    const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(response.status).toBe(404);
  });

  it('insight 필드가 포함된다', async () => {
    const responsesWithPersona = [
      { id: 'r1', question_id: 'q-uuid-1', user_id: null, selected_option: '실무자', persona_label: '자율형 독립가', created_at: '2026-03-17T00:00:00Z' },
      { id: 'r2', question_id: 'q-uuid-1', user_id: null, selected_option: '실무자', persona_label: '자율형 독립가', created_at: '2026-03-17T00:00:00Z' },
      { id: 'r3', question_id: 'q-uuid-1', user_id: null, selected_option: '리더', persona_label: '자율형 독립가', created_at: '2026-03-17T00:00:00Z' },
      { id: 'r4', question_id: 'q-uuid-1', user_id: null, selected_option: '조율자', persona_label: '협력적 조정자', created_at: '2026-03-17T00:00:00Z' },
    ];
    setupMocks({ responses: responsesWithPersona });
    const request = createRequest('http://localhost/api/questions/q-uuid-1/aggregate');
    const response = await GET(request, { params: mockParams });
    const body = await response.json();

    expect(body.data.insight).toBeDefined();
    expect(typeof body.data.insight === 'string' || body.data.insight === null).toBe(true);
  });

  it('prev_question_id와 next_question_id 필드가 포함된다', async () => {
    setupMocks();
    const request = createRequest('http://localhost/api/questions/q-uuid-1/aggregate');
    const response = await GET(request, { params: mockParams });
    const body = await response.json();

    expect('prev_question_id' in body.data).toBe(true);
    expect('next_question_id' in body.data).toBe(true);
  });

  it('응답이 없을 때 빈 results를 반환한다', async () => {
    setupMocks({ responses: [] });
    const request = createRequest('http://localhost/api/questions/q-uuid-1/aggregate');
    const response = await GET(request, { params: mockParams });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.results).toBeDefined();
    body.data.results.forEach((r: { count: number }) => {
      expect(r.count).toBe(0);
    });
  });
});
