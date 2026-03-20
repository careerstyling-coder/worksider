'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Users, Send, Filter } from 'lucide-react';

const INDUSTRIES = [
  'IT/소프트웨어', '금융/보험', '제조/생산', '유통/물류', '서비스업',
  '교육', '의료/제약/바이오', '건설/부동산', '미디어/엔터테인먼트',
  '광고/마케팅', '법률/회계/컨설팅', '공공/정부/비영리', '에너지/환경', '외식/식품',
];

const COMPANY_SIZES = [
  { value: 'xs', label: '5인 이하' },
  { value: 'small', label: '5~30인' },
  { value: 'medium', label: '30~100인' },
  { value: 'large', label: '100~1,000인' },
  { value: 'xlarge', label: '1,000인 이상' },
];

const PERSONAS = ['전략적 성과자', '실무형 전문가', '협력적 조정자', '자율형 독립가', '조직형 정치인', '중도형 균형가'];

interface Props {
  question: { id: string; title: string };
  onClose: () => void;
  onDeploy: (config: DeployConfig) => void;
}

export interface DeployConfig {
  questionId: string;
  options: string[];
  deadline: string;
  targetFilter: {
    industry?: string;
    companySize?: string;
    persona?: string;
  };
}

function MultiCheckbox({ label, options, selected, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const allSelected = selected.length === 0;
  const toggle = (value: string) => {
    if (selected.includes(value)) onChange(selected.filter(v => v !== value));
    else onChange([...selected, value]);
  };
  return (
    <div>
      <p className="text-sm font-medium text-text-secondary mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onChange([])}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${allSelected ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border hover:border-primary'}`}
        >
          모두
        </button>
        {options.map(opt => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${active ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border hover:border-primary'}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SurveyDeployModal({ question, onClose, onDeploy }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [industries, setIndustries] = useState<string[]>([]);
  const [companySizes, setCompanySizes] = useState<string[]>([]);
  const [personas, setPersonas] = useState<string[]>([]);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const handlePreview = () => {
    let count = 157;
    if (industries.length > 0) count = Math.floor(count * (industries.length * 0.15));
    if (companySizes.length > 0) count = Math.floor(count * (companySizes.length * 0.2));
    if (personas.length > 0) count = Math.floor(count * (personas.length * 0.15));
    setPreviewCount(Math.max(count, 2));
  };

  const filterSummary = () => {
    const parts: string[] = [];
    parts.push(industries.length > 0 ? industries.join(', ') : '전체 산업');
    parts.push(companySizes.length > 0 ? companySizes.map(v => COMPANY_SIZES.find(s => s.value === v)?.label || v).join(', ') : '전체 규모');
    parts.push(personas.length > 0 ? personas.join(', ') : '전체 유형');
    return parts.join(' · ');
  };

  const handleDeploy = () => {
    onDeploy({
      questionId: question.id,
      options: [],
      deadline: '',
      targetFilter: {
        ...(industries.length > 0 && { industry: industries.join(',') }),
        ...(companySizes.length > 0 && { companySize: companySizes.join(',') }),
        ...(personas.length > 0 && { persona: personas.join(',') }),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg border border-border w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-divider">
          <div>
            <h2 className="text-lg font-bold text-text-primary">배포 설정</h2>
            <p className="text-xs text-text-tertiary mt-0.5">Step {step}/2</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-hover rounded transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* 질문 제목 */}
          <div className="mb-5 p-3 bg-[#F7F8FA] rounded-lg">
            <p className="text-sm text-text-primary font-medium">{question.title}</p>
          </div>

          {/* Step 1: 대상자 필터 (다중 선택) */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-primary" />
                <span className="text-sm font-semibold text-text-primary">대상자 조건 설정</span>
              </div>
              <p className="text-xs text-text-tertiary">&lsquo;모두&rsquo;를 선택하면 해당 조건의 전체 사용자에게 배포됩니다. 여러 개를 선택할 수 있어요.</p>

              <MultiCheckbox
                label="산업군"
                options={INDUSTRIES.map(i => ({ value: i, label: i }))}
                selected={industries}
                onChange={setIndustries}
              />

              <MultiCheckbox
                label="회사 규모"
                options={COMPANY_SIZES}
                selected={companySizes}
                onChange={setCompanySizes}
              />

              <MultiCheckbox
                label="페르소나 유형"
                options={PERSONAS.map(p => ({ value: p, label: p }))}
                selected={personas}
                onChange={setPersonas}
              />

              {/* 예상 대상자 */}
              <button onClick={handlePreview} className="text-sm text-primary hover:underline flex items-center gap-1">
                <Users size={14} /> 예상 대상자 수 확인
              </button>
              {previewCount !== null && (
                <div className="p-3 bg-primary-light rounded-lg border border-primary/20">
                  <p className="text-sm text-primary font-semibold">예상 대상: {previewCount}명</p>
                  <p className="text-xs text-text-secondary mt-0.5">{filterSummary()}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" size="md" className="flex-1" onClick={onClose}>취소</Button>
                <Button variant="primary" size="md" className="flex-1" onClick={() => { handlePreview(); setStep(2); }}>다음: 최종 확인</Button>
              </div>
            </div>
          )}

          {/* Step 2: 최종 확인 + 배포 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Send size={16} className="text-primary" />
                <span className="text-sm font-semibold text-text-primary">배포 전 최종 확인</span>
              </div>

              <div className="space-y-2 p-4 bg-[#F7F8FA] rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">대상 산업</span>
                  <span className="text-text-primary font-medium text-right max-w-[200px]">{industries.length > 0 ? industries.join(', ') : '전체'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">대상 규모</span>
                  <span className="text-text-primary font-medium">{companySizes.length > 0 ? companySizes.map(v => COMPANY_SIZES.find(s => s.value === v)?.label || v).join(', ') : '전체'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">대상 유형</span>
                  <span className="text-text-primary font-medium text-right max-w-[200px]">{personas.length > 0 ? personas.join(', ') : '전체'}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-divider">
                  <span className="text-text-secondary font-semibold">예상 대상</span>
                  <span className="text-primary font-bold">{previewCount ?? '전체'}명</span>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-text-primary">⚠️ 배포 후에는 취소할 수 없습니다. 대상자의 &quot;나에게 온 설문&quot;에 표시됩니다.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="md" className="flex-1" onClick={() => setStep(1)}>이전</Button>
                <Button variant="primary" size="md" className="flex-1" onClick={handleDeploy}>
                  <Send size={14} /> 배포하기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
