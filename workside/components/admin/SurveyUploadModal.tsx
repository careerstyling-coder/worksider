'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Upload, FileSpreadsheet, GripVertical, Trash2, Plus, Eye } from 'lucide-react';

interface SurveyItem {
  id: string;
  question: string;
  options: string[];
}

interface Props {
  onClose: () => void;
  onConfirm: (title: string, items: SurveyItem[]) => void;
  initialTitle?: string;
}

function parseCSV(text: string): SurveyItem[] {
  const lines = text.trim().split('\n');
  const items: SurveyItem[] = [];

  // 첫 줄이 헤더인지 확인
  const startIndex = lines[0]?.toLowerCase().includes('질문') || lines[0]?.toLowerCase().includes('question') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(/[,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 3) continue; // 최소 질문 + 선택지 2개

    const question = cols[0] || cols[1]; // 첫 열이 번호면 두 번째가 질문
    const options = cols.slice(cols[0]?.match(/^\d+$/) ? 2 : 1).filter(Boolean);

    if (question && options.length >= 2) {
      items.push({
        id: `item-${Date.now()}-${i}`,
        question: cols[0]?.match(/^\d+$/) ? cols[1] : cols[0],
        options,
      });
    }
  }
  return items;
}

export default function SurveyUploadModal({ onClose, onConfirm, initialTitle = '' }: Props) {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [title, setTitle] = useState(initialTitle);
  const [items, setItems] = useState<SurveyItem[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        setItems(parsed);
        setStep('review');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const updateItem = (id: string, field: 'question', value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const updateOption = (itemId: string, optIndex: number, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const options = [...item.options];
      options[optIndex] = value;
      return { ...item, options };
    }));
  };

  const addOption = (itemId: string) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, options: [...item.options, ''] } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: `item-${Date.now()}`, question: '', options: ['', ''] }]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg border border-border w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-divider sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-text-primary">정식 설문 만들기</h2>
            <p className="text-xs text-text-tertiary mt-0.5">{step === 'upload' ? 'CSV/Excel 파일 업로드' : `${items.length}개 문항 검토`}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-hover rounded transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Step 1: 업로드 */}
          {step === 'upload' && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">설문 제목</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예) 업무환경 종합 설문"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* 파일 업로드 영역 */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${dragOver ? 'border-primary bg-primary-light' : 'border-border'}`}
              >
                <FileSpreadsheet size={40} className="text-text-tertiary mx-auto mb-3" />
                <p className="text-sm text-text-primary font-medium">CSV 또는 Excel 파일을 드래그하거나</p>
                <label className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-hover transition">
                  <Upload size={14} /> 파일 선택
                  <input type="file" accept=".csv,.tsv,.txt,.xlsx" onChange={handleFileInput} className="hidden" />
                </label>
                <p className="text-xs text-text-tertiary mt-3">파일 형식: 질문, 선택지1, 선택지2, 선택지3, ...</p>
              </div>

              {/* CSV 형식 예시 */}
              <div className="bg-[#F7F8FA] rounded-lg p-4">
                <p className="text-xs font-semibold text-text-secondary mb-2">CSV 형식 예시</p>
                <pre className="text-xs text-text-tertiary leading-relaxed font-mono">
{`질문,선택지1,선택지2,선택지3
상사의 리더십 유형 선호는?,코칭형,위임형,지시형
이상적인 회의 빈도는?,매일,주 2회,주 1회,필요시만
원격근무 만족도는?,매우 만족,만족,보통,불만족`}
                </pre>
              </div>

              {/* 또는 직접 입력 */}
              <button onClick={() => { addItem(); addItem(); setStep('review'); }} className="w-full text-center text-sm text-primary hover:underline">
                파일 없이 직접 입력하기 →
              </button>
            </div>
          )}

          {/* Step 2: 검토 & 수정 */}
          {step === 'review' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">설문 제목</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="설문 제목을 입력하세요"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* 문항 목록 */}
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="border border-border rounded-lg p-4 bg-white">
                    <div className="flex items-start gap-2 mb-3">
                      <GripVertical size={16} className="text-text-tertiary mt-1 shrink-0 cursor-grab" />
                      <span className="text-xs text-text-tertiary mt-1 shrink-0 w-5">{idx + 1}.</span>
                      <input type="text" value={item.question} onChange={(e) => updateItem(item.id, 'question', e.target.value)} placeholder="질문을 입력하세요"
                        className="flex-1 px-2 py-1 border-b border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary" />
                      <button onClick={() => removeItem(item.id)} className="p-1 text-text-tertiary hover:text-error transition shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="pl-7 space-y-1.5">
                      {item.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[10px] text-text-tertiary shrink-0">{oi + 1}</span>
                          <input type="text" value={opt} onChange={(e) => updateOption(item.id, oi, e.target.value)} placeholder={`선택지 ${oi + 1}`}
                            className="flex-1 px-2 py-1 text-sm text-text-primary placeholder:text-text-tertiary border-b border-divider focus:outline-none focus:border-primary" />
                        </div>
                      ))}
                      <button onClick={() => addOption(item.id)} className="text-xs text-primary hover:underline ml-7">+ 선택지 추가</button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addItem} className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-border rounded-lg text-sm text-text-secondary hover:border-primary hover:text-primary transition">
                <Plus size={14} /> 문항 추가
              </button>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="md" className="flex-1" onClick={() => setStep('upload')}>이전</Button>
                <Button variant="primary" size="md" className="flex-1" disabled={!title.trim() || items.filter(i => i.question && i.options.filter(Boolean).length >= 2).length < 1} onClick={() => onConfirm(title, items)}>
                  <Eye size={14} /> 설문 확정 → 배포 설정
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
