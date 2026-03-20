// @TASK P1-R1-T1 - User 관련 TypeScript 타입 정의
// @SPEC docs/planning/02-trd.md#users-table

export type UserRole = 'user' | 'admin';
export type Industry =
  | 'IT/소프트웨어' | '금융/보험' | '제조/생산' | '유통/물류' | '서비스업'
  | '교육' | '의료/제약/바이오' | '건설/부동산' | '미디어/엔터테인먼트'
  | '광고/마케팅' | '법률/회계/컨설팅' | '공공/정부/비영리' | '에너지/환경'
  | '외식/식품' | '기타';
export type CompanySize = 'xs' | 'small' | 'medium' | 'large' | 'xlarge';

export interface User {
  id: string;
  email: string;
  nickname: string;
  industry: Industry | null;
  company_size: CompanySize | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// @TASK P2-R1-T1 - DNA Session 관련 타입 정의
// @SPEC docs/planning/02-trd.md#dna-sessions
export type DNAVersion = 'semi' | 'full';
export type SessionStatus = 'in_progress' | 'completed';

export interface DNASession {
  id: string;
  user_id: string | null;
  version: DNAVersion;
  status: SessionStatus;
  share_token: string | null;
  created_at: string;
  completed_at: string | null;
}

// @TASK P2-R1-T2 - DNA Response 타입 정의
// @SPEC docs/planning/02-trd.md#dna-responses
export interface DNAResponse {
  id: string;
  session_id: string;
  question_id: string;
  value: number;
  created_at: string;
}

// @TASK P2-R2-T1 - DNA Result 타입 정의
// @SPEC docs/planning/02-trd.md#dna-results
export interface DNAResult {
  id: string;
  session_id: string;
  user_id: string | null;
  p_score: number;
  c_score: number;
  pol_score: number;
  s_score: number;
  persona_label: string;
  persona_description: string;
  version: DNAVersion;
  share_token: string;
  created_at: string;
}

// @TASK P3-R1-T1 - Question 관련 타입 정의
// @SPEC docs/planning/02-trd.md#questions
export type QuestionType = 'simple' | 'survey';
export type QuestionStatus = 'draft' | 'active' | 'closed';

export interface Question {
  id: string;
  title: string;
  description: string | null;
  type: QuestionType;
  status: QuestionStatus;
  is_featured: boolean;
  options: unknown[];
  created_by: string | null;
  suggestion_id: string | null;
  deadline: string | null;
  participant_count: number;
  created_at: string;
}

// @TASK P3-R2-T1 - QuestionResponse 타입 정의
// @SPEC docs/planning/02-trd.md#question-responses
export interface QuestionResponse {
  id: string;
  question_id: string;
  user_id: string | null;
  selected_option: string;
  persona_label: string | null;
  created_at: string;
}

// @TASK P3-R2-T2 - Suggestion 관련 타입 정의
// @SPEC docs/planning/02-trd.md#suggestions
export type SuggestionStatus = 'pending' | 'approved' | 'rejected';
export type ActionType = 'diagnosis' | 'question' | 'suggestion' | 'share' | 'shout_out';

export interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  background: string | null;
  status: SuggestionStatus;
  shout_out_count: number;
  created_at: string;
}

export interface ShoutOut {
  id: string;
  suggestion_id: string;
  user_id: string;
  created_at: string;
}

// @TASK P3-R3-T1 - Participation History 타입 정의
// @SPEC docs/planning/02-trd.md#participation-history
export interface ParticipationHistory {
  id: string;
  user_id: string;
  action_type: ActionType;
  target_id: string;
  created_at: string;
}

// @TASK P5-R1-T1 - AppSetting 타입 정의
// @SPEC docs/planning/02-trd.md#app-settings
export interface AppSetting {
  id: string;
  key: string;
  value: any;
  updated_at: string;
}
