'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminMenu } from '@/components/AdminMenu';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { FilterTabs } from '@/components/FilterTabs';
import { Plus, Edit, StopCircle, Trash2, Check, X } from 'lucide-react';
import type { Question, Suggestion } from '@/types/database';

const TABS = [
  { label: '모든 질문', value: 'all' },
  { label: '초안', value: 'draft' },
  { label: '배포중', value: 'active' },
  { label: '마감', value: 'closed' },
  { label: '제안 검토', value: 'suggestions' },
];

const STATUS_BADGES: Record<string, string> = {
  draft: 'bg-bg-active text-text-secondary',
  active: 'bg-green-900 text-green-300',
  closed: 'bg-red-900 text-red-300',
};

export default function AdminQuestionsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', description: '', type: 'simple', options: ['', ''] });

  const loadQuestions = useCallback(async () => {
    const params = activeTab !== 'all' && activeTab !== 'suggestions' ? `?status=${activeTab}` : '';
    const res = await fetch(`/api/questions${params}`);
    const data = await res.json();
    if (data.data) setQuestions(data.data);
  }, [activeTab]);

  const loadSuggestions = useCallback(async () => {
    const res = await fetch('/api/suggestions?status=pending');
    const data = await res.json();
    if (data.data) setSuggestions(data.data);
  }, []);

  useEffect(() => {
    if (activeTab === 'suggestions') loadSuggestions();
    else loadQuestions();
  }, [activeTab, loadQuestions, loadSuggestions]);

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadQuestions();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    loadQuestions();
  };

  const handleCreateQuestion = async () => {
    const options = newQuestion.options.filter(Boolean).map((label, i) => ({ id: `opt_${i}`, label }));
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newQuestion, options }),
    });
    setShowModal(false);
    setNewQuestion({ title: '', description: '', type: 'simple', options: ['', ''] });
    loadQuestions();
  };

  const handleSuggestionAction = async (id: string, status: 'approved' | 'rejected') => {
    await fetch(`/api/suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadSuggestions();
  };

  return (
    <SidebarLayout sidebar={<AdminMenu activeRoute="/admin/questions" />}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">질문 관리</h1>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm text-text-primary">
            <Plus size={16} /> 새 질문 추가
          </button>
        </div>

        <FilterTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'suggestions' ? (
          <div className="mt-6 space-y-4">
            {suggestions.length === 0 ? (
              <p className="text-text-secondary">대기중인 제안이 없습니다.</p>
            ) : suggestions.map((s) => (
              <div key={s.id} className="bg-[#F7F8FA] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-text-primary font-medium">{s.title}</h3>
                  {s.background && <p className="text-text-secondary text-sm mt-1">{s.background}</p>}
                  <span className="text-xs text-text-secondary">Shout out: {s.shout_out_count}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSuggestionAction(s.id, 'approved')} className="p-2 bg-green-900 hover:bg-green-800 rounded text-green-300"><Check size={16} /></button>
                  <button onClick={() => handleSuggestionAction(s.id, 'rejected')} className="p-2 bg-red-900 hover:bg-red-800 rounded text-red-300"><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <table className="w-full">
              <thead>
                <tr className="text-left text-text-secondary text-sm border-b border-border">
                  <th className="pb-3">제목</th>
                  <th className="pb-3">상태</th>
                  <th className="pb-3">참여</th>
                  <th className="pb-3">생성일</th>
                  <th className="pb-3">액션</th>
                </tr>
              </thead>
              <tbody className="text-text-primary text-sm">
                {questions.map((q) => (
                  <tr key={q.id} className="border-b border-border/50 hover:bg-bg-page/50">
                    <td className="py-3">{q.title}</td>
                    <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs ${STATUS_BADGES[q.status] || ''}`}>{q.status}</span></td>
                    <td className="py-3">{q.participant_count}</td>
                    <td className="py-3 text-text-secondary">{new Date(q.created_at).toLocaleDateString('ko-KR')}</td>
                    <td className="py-3 flex gap-1">
                      {q.status === 'draft' && <button onClick={() => handleStatusChange(q.id, 'active')} className="p-1 text-green-400 hover:text-green-300" title="배포"><Check size={14} /></button>}
                      {q.status === 'active' && <button onClick={() => handleStatusChange(q.id, 'closed')} className="p-1 text-yellow-400 hover:text-yellow-300" title="마감"><StopCircle size={14} /></button>}
                      <button onClick={() => handleDelete(q.id)} className="p-1 text-error hover:text-red-300" title="삭제"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Question Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#F7F8FA] rounded-xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold text-text-primary mb-4">새 질문 추가</h2>
              <input type="text" placeholder="질문 제목" value={newQuestion.title} onChange={(e) => setNewQuestion(q => ({ ...q, title: e.target.value }))} className="w-full bg-bg-active text-text-primary rounded px-3 py-2 mb-3 text-sm" />
              <textarea placeholder="설명 (선택)" value={newQuestion.description} onChange={(e) => setNewQuestion(q => ({ ...q, description: e.target.value }))} className="w-full bg-bg-active text-text-primary rounded px-3 py-2 mb-3 text-sm h-20" />
              <div className="mb-3">
                <label className="text-sm text-text-secondary block mb-1">옵션</label>
                {newQuestion.options.map((opt, i) => (
                  <input key={i} type="text" placeholder={`옵션 ${i + 1}`} value={opt} onChange={(e) => { const opts = [...newQuestion.options]; opts[i] = e.target.value; setNewQuestion(q => ({ ...q, options: opts })); }} className="w-full bg-bg-active text-text-primary rounded px-3 py-2 mb-1 text-sm" />
                ))}
                <button onClick={() => setNewQuestion(q => ({ ...q, options: [...q.options, ''] }))} className="text-primary text-sm mt-1">+ 옵션 추가</button>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-bg-active rounded text-sm text-text-primary">취소</button>
                <button onClick={handleCreateQuestion} disabled={!newQuestion.title} className="px-4 py-2 bg-primary rounded text-sm text-white disabled:opacity-50">생성</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
