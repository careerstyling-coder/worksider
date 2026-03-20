'use client';

import { useState } from 'react';
import { AdminMenu } from '@/components/AdminMenu';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { FilterTabs } from '@/components/FilterTabs';
import { Button } from '@/components/ui/Button';
import { Plus, Check, X, StopCircle, Trash2, ArrowUpCircle, FileText, ClipboardList, Send, FileSpreadsheet } from 'lucide-react';
import SurveyDeployModal, { type DeployConfig } from '@/components/admin/SurveyDeployModal';
import SurveyUploadModal from '@/components/admin/SurveyUploadModal';

const TABS = [
  { label: '모든 질문', value: 'all' },
  { label: '단순 질문', value: 'simple' },
  { label: '정식 설문', value: 'formal' },
  { label: '마감', value: 'closed' },
  { label: '궁금합니다 검토', value: 'suggestions' },
];

interface Question {
  id: string;
  title: string;
  status: string;
  survey_type: 'simple' | 'formal';
  participant_count: number;
  created_at: string;
}

const initialQuestions: Question[] = [
  { id: '1', title: '업무 중 가장 스트레스를 받는 상황은?', status: 'active', survey_type: 'simple', participant_count: 156, created_at: '2026-03-10' },
  { id: '2', title: '이상적인 상사의 리더십 스타일은?', status: 'active', survey_type: 'formal', participant_count: 98, created_at: '2026-03-08' },
  { id: '3', title: '재택근무 vs 출근근무 선호도', status: 'closed', survey_type: 'simple', participant_count: 234, created_at: '2026-02-28' },
  { id: '4', title: '업무 성장에 가장 도움이 되는 것은?', status: 'active', survey_type: 'simple', participant_count: 45, created_at: '2026-03-15' },
];

interface Suggestion {
  id: string;
  title: string;
  background: string | null;
  shout_out_count: number;
  formal_request: boolean;
}

const initialSuggestions: Suggestion[] = [
  { id: 's1', title: '직장인 독서 모임 운영에 대해 어떻게 생각하시나요?', background: '최근 자기개발에 대한 관심이 높아지고 있어서...', shout_out_count: 31, formal_request: true },
  { id: 's2', title: '업무 중 음악 듣는 것에 대한 의견', background: null, shout_out_count: 12, formal_request: false },
  { id: 's3', title: '점심시간 활용법 — 운동 vs 휴식 vs 공부', background: '점심시간 1시간을 어떻게 보내는지 궁금합니다.', shout_out_count: 24, formal_request: false },
];

const TYPE_BADGE = {
  simple: { label: '단순 질문', style: 'bg-blue-50 text-blue-700' },
  formal: { label: '정식 설문', style: 'bg-purple-50 text-purple-700' },
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-text-secondary',
};

export default function AdminQuestionsDemo() {
  const [activeTab, setActiveTab] = useState('all');
  const [questions, setQuestions] = useState(initialQuestions);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [adoptModal, setAdoptModal] = useState<Suggestion | null>(null);
  const [adoptStep, setAdoptStep] = useState<'type' | 'options'>('type');
  const [adoptType, setAdoptType] = useState<'simple' | 'formal'>('simple');
  const [adoptOptions, setAdoptOptions] = useState(['', '']);
  const [adoptDeadline, setAdoptDeadline] = useState('');
  const [upgradeModal, setUpgradeModal] = useState<Question | null>(null);
  const [deployModal, setDeployModal] = useState<Question | null>(null);
  const [deployedMsg, setDeployedMsg] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [detailModal, setDetailModal] = useState<Question | null>(null);
  const [newQTitle, setNewQTitle] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '']);
  const [newQDeadline, setNewQDeadline] = useState('');

  const handleCreateQuestion = () => {
    if (!newQTitle.trim() || newQOptions.filter(Boolean).length < 2) return;
    setQuestions(prev => [...prev, {
      id: `new-${Date.now()}`,
      title: newQTitle,
      status: 'active',
      survey_type: 'simple' as const,
      participant_count: 0,
      created_at: new Date().toISOString().split('T')[0],
    }]);
    setShowNewQuestionModal(false);
    setNewQTitle('');
    setNewQOptions(['', '']);
    setNewQDeadline('');
  };

  const handleSurveyUploadConfirm = (surveyTitle: string, items: { question: string; options: string[] }[]) => {
    const newQ: Question = {
      id: `survey-${Date.now()}`,
      title: `[정식 설문] ${surveyTitle} (${items.length}문항)`,
      status: 'active',
      survey_type: 'formal',
      participant_count: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    setQuestions(prev => [...prev, newQ]);
    // 업로드 완료 시 궁금합니다 목록에서 제거
    if (adoptingSuggestionId) {
      setSuggestions(prev => prev.filter(s => s.id !== adoptingSuggestionId));
      setAdoptingSuggestionId('');
    }
    setShowUploadModal(false);
    setAdoptedSuggestionTitle('');
    setTimeout(() => setDeployModal(newQ), 100);
  };

  const handleDeploy = (config: DeployConfig) => {
    setDeployedMsg(`"${deployModal?.title}" 설문이 배포되었습니다.`);
    setDeployModal(null);
    setTimeout(() => setDeployedMsg(null), 4000);
  };

  const openAdoptModal = (s: Suggestion) => {
    setAdoptModal(s);
    setAdoptStep('type');
    setAdoptType('simple');
    setAdoptOptions(['', '']);
    setAdoptDeadline('');
  };

  const handleAdoptTypeSelect = (type: 'simple' | 'formal') => {
    setAdoptType(type);
    if (type === 'simple') {
      setAdoptStep('options');
    } else {
      // 정식 설문: 채택 모달 닫고 → 업로드 모달 열기
      // 목록에서 제거하지 않음 — 업로드 완료 시 제거
      const title = adoptModal?.title || '';
      const adoptingId = adoptModal?.id || '';
      setAdoptModal(null);
      setShowUploadModal(true);
      setAdoptedSuggestionTitle(title);
      setAdoptingSuggestionId(adoptingId);
    }
  };

  const [adoptedSuggestionTitle, setAdoptedSuggestionTitle] = useState('');
  const [adoptingSuggestionId, setAdoptingSuggestionId] = useState('');

  const handleAdoptConfirm = () => {
    if (!adoptModal) return;
    const newQ: Question = {
      id: `new-${Date.now()}`,
      title: adoptModal.title,
      status: 'active',
      survey_type: 'simple',
      participant_count: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    setQuestions(prev => [...prev, newQ]);
    setSuggestions(prev => prev.filter(s => s.id !== adoptModal.id));
    setAdoptModal(null);
    // 단순 질문도 배포 설정으로 연결 (다음 렌더 사이클에서 열기)
    setTimeout(() => setDeployModal(newQ), 100);
  };

  const handleUpgrade = () => {
    if (!upgradeModal) return;
    setQuestions(prev => [
      ...prev.map(q => q.id === upgradeModal.id ? { ...q, status: 'closed' } : q),
      {
        id: `formal-${Date.now()}`,
        title: `[정식 설문] ${upgradeModal.title}`,
        status: 'active',
        survey_type: 'formal' as const,
        participant_count: 0,
        created_at: new Date().toISOString().split('T')[0],
      },
    ]);
    setUpgradeModal(null);
  };

  const filtered = activeTab === 'all'
    ? questions
    : activeTab === 'suggestions'
    ? []
    : questions.filter(q => {
        if (activeTab === 'simple') return q.survey_type === 'simple' && q.status === 'active';
        if (activeTab === 'formal') return q.survey_type === 'formal' && q.status === 'active';
        if (activeTab === 'closed') return q.status === 'closed';
        return true;
      });

  return (
    <SidebarLayout sidebar={<AdminMenu activeRoute="/demo/phase-5/admin-questions" basePath="/demo/phase-5" />}>
      <div className="p-6 bg-bg-page min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">질문 관리</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="md" onClick={() => setShowUploadModal(true)}><FileSpreadsheet size={16} /> 정식 설문 만들기</Button>
            <Button variant="primary" size="md" onClick={() => setShowNewQuestionModal(true)}><Plus size={16} /> 새 질문 추가</Button>
          </div>
        </div>

        <FilterTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {/* 궁금합니다 검토 */}
        {activeTab === 'suggestions' ? (
          <div className="mt-6 space-y-3">
            <h2 className="text-[15px] font-semibold text-text-secondary">궁금합니다 검토 ({suggestions.length}건)</h2>
            {suggestions.sort((a, b) => b.shout_out_count - a.shout_out_count).map((s) => (
              <div key={s.id} className="bg-white rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[15px] font-medium text-text-primary">{s.title}</h3>
                      {s.formal_request && (
                        <span className="text-[11px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">설문 신청</span>
                      )}
                    </div>
                    {s.background && <p className="text-sm text-text-secondary mt-1">{s.background}</p>}
                    <span className="text-xs text-text-tertiary mt-2 inline-block">Shout out: {s.shout_out_count}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openAdoptModal(s)} className="p-2 bg-green-50 hover:bg-green-100 rounded-md text-green-700 transition" title="채택">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setSuggestions(prev => prev.filter(x => x.id !== s.id))} className="p-2 bg-red-50 hover:bg-red-100 rounded-md text-red-700 transition" title="반려">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 질문 테이블 */
          <div className="mt-6 bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-text-secondary border-b border-divider">
                  <th className="px-4 py-3 font-medium">제목</th>
                  <th className="px-4 py-3 font-medium">유형</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium">참여</th>
                  <th className="px-4 py-3 font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} className="border-b border-divider hover:bg-bg-hover transition cursor-pointer" onClick={() => setDetailModal(q)}>
                    <td className="px-4 py-3 text-[15px] text-primary font-medium hover:underline">{q.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[q.survey_type].style}`}>
                        {TYPE_BADGE[q.survey_type].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[q.status] || ''}`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{q.participant_count}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {q.survey_type === 'simple' && q.status === 'active' && (
                          <button onClick={() => setUpgradeModal(q)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition" title="정식 설문으로 확대">
                            <ArrowUpCircle size={16} />
                          </button>
                        )}
                        {q.status === 'active' && (
                          <button onClick={() => setDeployModal(q)} className="p-1.5 text-primary hover:bg-primary-light rounded transition" title="대상자 지정 배포">
                            <Send size={16} />
                          </button>
                        )}
                        {q.status === 'active' && (
                          <button onClick={() => setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, status: 'closed' } : x))} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition" title="마감">
                            <StopCircle size={14} />
                          </button>
                        )}
                        <button className="p-1.5 text-red-500 hover:bg-red-50 rounded transition" title="삭제"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 채택 모달 (다단계) */}
      {adoptModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-md shadow-xl">
            {/* Step 1: 유형 선택 */}
            {adoptStep === 'type' && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-2">채택 유형 선택</h2>
                <p className="text-sm text-text-secondary mb-1">&ldquo;{adoptModal.title}&rdquo;</p>
                {adoptModal.formal_request && (
                  <p className="text-xs text-purple-600 mb-4">💡 작성자가 정식 설문을 신청했습니다</p>
                )}
                <div className="space-y-3 mt-4">
                  <button onClick={() => handleAdoptTypeSelect('simple')} className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary-light transition text-left">
                    <FileText size={24} className="text-primary shrink-0" />
                    <div>
                      <span className="text-[15px] font-semibold text-text-primary">단순 질문</span>
                      <span className="block text-xs text-text-secondary mt-0.5">피드에 전체 공개, 기한 내 누구나 참여</span>
                    </div>
                  </button>
                  <button onClick={() => handleAdoptTypeSelect('formal')} className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-purple-500 hover:bg-purple-50 transition text-left">
                    <ClipboardList size={24} className="text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[15px] font-semibold text-text-primary">정식 설문</span>
                      <span className="block text-xs text-text-secondary mt-0.5">특정 대상자에게 배포, 심층 분석 가능</span>
                    </div>
                  </button>
                </div>
                <button onClick={() => setAdoptModal(null)} className="mt-4 w-full text-center text-sm text-text-tertiary hover:text-text-primary transition">취소</button>
              </>
            )}

            {/* Step 2: 선택지 + 마감일 설정 */}
            {adoptStep === 'options' && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-1">
                  {adoptType === 'simple' ? '단순 질문' : '정식 설문'} 설정
                </h2>
                <p className="text-sm text-text-secondary mb-4">&ldquo;{adoptModal.title}&rdquo;</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-2">선택지</label>
                    {adoptOptions.map((opt, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input type="text" value={opt} placeholder={`선택지 ${i + 1}`}
                          onChange={(e) => { const o = [...adoptOptions]; o[i] = e.target.value; setAdoptOptions(o); }}
                          className="flex-1 px-3 py-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary" />
                        {adoptOptions.length > 2 && (
                          <button onClick={() => setAdoptOptions(adoptOptions.filter((_, j) => j !== i))} className="p-2 text-text-tertiary hover:text-error"><X size={14} /></button>
                        )}
                      </div>
                    ))}
                    {adoptOptions.length < 10 && (
                      <button onClick={() => setAdoptOptions([...adoptOptions, ''])} className="text-sm text-primary hover:underline">+ 선택지 추가</button>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-2">마감일</label>
                    <input type="date" value={adoptDeadline} onChange={(e) => setAdoptDeadline(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" size="md" className="flex-1" onClick={() => setAdoptStep('type')}>이전</Button>
                    <Button variant="primary" size="md" className="flex-1" disabled={adoptOptions.filter(Boolean).length < 2} onClick={handleAdoptConfirm}>
                      질문 생성 → 배포 설정
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 정식 설문 확대 모달 */}
      {upgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-2">정식 설문으로 확대</h2>
            <p className="text-sm text-text-secondary mb-4">
              &ldquo;{upgradeModal.title}&rdquo;을 정식 설문으로 전환합니다.
              기존 단순 질문은 마감되고, 새 정식 설문이 생성됩니다.
            </p>
            <p className="text-xs text-text-tertiary mb-4">현재 참여: {upgradeModal.participant_count}명의 데이터가 보존됩니다.</p>
            <div className="flex gap-3">
              <Button variant="outline" size="md" className="flex-1" onClick={() => setUpgradeModal(null)}>취소</Button>
              <Button variant="primary" size="md" className="flex-1" onClick={handleUpgrade}>
                <ArrowUpCircle size={16} /> 확대 전환
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 질문 상세 모달 */}
      {detailModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[detailModal.survey_type].style}`}>
                  {TYPE_BADGE[detailModal.survey_type].label}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[detailModal.status] || 'bg-gray-100 text-text-secondary'}`}>
                  {detailModal.status}
                </span>
              </div>
              <button onClick={() => setDetailModal(null)} className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-hover rounded transition">
                <X size={18} />
              </button>
            </div>

            <h2 className="text-lg font-bold text-text-primary mb-3">{detailModal.title}</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2.5 bg-[#F7F8FA] rounded">
                <span className="text-text-secondary">참여자 수</span>
                <span className="text-text-primary font-medium">{detailModal.participant_count}명</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#F7F8FA] rounded">
                <span className="text-text-secondary">생성일</span>
                <span className="text-text-primary font-medium">{detailModal.created_at}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#F7F8FA] rounded">
                <span className="text-text-secondary">유형</span>
                <span className="text-text-primary font-medium">{TYPE_BADGE[detailModal.survey_type].label}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              {detailModal.status === 'active' && detailModal.participant_count > 0 && (
                <a href={`/demo/phase-3/t3-1-question-result`} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary rounded-lg text-sm font-medium text-white hover:bg-primary-hover transition">
                  결과 보기
                </a>
              )}
              {detailModal.status === 'active' && (
                <button onClick={() => { setDeployModal(detailModal); setDetailModal(null); }} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-bg-hover transition">
                  <Send size={14} /> 배포 설정
                </button>
              )}
              <button onClick={() => setDetailModal(null)} className="px-4 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-hover transition">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 새 질문 추가 모달 */}
      {showNewQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-text-primary mb-4">새 질문 추가</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">질문 제목</label>
                <input type="text" value={newQTitle} onChange={(e) => setNewQTitle(e.target.value)} placeholder="질문을 입력하세요"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">선택지</label>
                {newQOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={opt} placeholder={`선택지 ${i + 1}`}
                      onChange={(e) => { const o = [...newQOptions]; o[i] = e.target.value; setNewQOptions(o); }}
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary" />
                    {newQOptions.length > 2 && (
                      <button onClick={() => setNewQOptions(newQOptions.filter((_, j) => j !== i))} className="p-2 text-text-tertiary hover:text-error"><X size={14} /></button>
                    )}
                  </div>
                ))}
                {newQOptions.length < 10 && (
                  <button onClick={() => setNewQOptions([...newQOptions, ''])} className="text-sm text-primary hover:underline">+ 선택지 추가</button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">마감일 (선택)</label>
                <input type="date" value={newQDeadline} onChange={(e) => setNewQDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="md" className="flex-1" onClick={() => setShowNewQuestionModal(false)}>취소</Button>
                <Button variant="primary" size="md" className="flex-1" disabled={!newQTitle.trim() || newQOptions.filter(Boolean).length < 2} onClick={handleCreateQuestion}>질문 생성</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 정식 설문 업로드 모달 */}
      {showUploadModal && (
        <SurveyUploadModal onClose={() => { setShowUploadModal(false); setAdoptedSuggestionTitle(''); setAdoptingSuggestionId(''); }} onConfirm={handleSurveyUploadConfirm} initialTitle={adoptedSuggestionTitle} />
      )}

      {/* 설문 배포 모달 */}
      {deployModal && (
        <SurveyDeployModal
          question={deployModal}
          onClose={() => setDeployModal(null)}
          onDeploy={handleDeploy}
        />
      )}

      {/* 배포 완료 알림 */}
      {deployedMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-success text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in">
          ✓ {deployedMsg}
        </div>
      )}
    </SidebarLayout>
  );
}
