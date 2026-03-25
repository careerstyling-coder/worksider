'use client';

// @TASK P2-S1-T1 - 랜딩 페이지 ReservationForm
// @SPEC specs/screens/prelaunch/landing

import { useState, FormEvent } from 'react';

export type ReservationFormStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ReservationFormData {
  email: string;
  industry: string;
  experience_years: string;
}

interface ReservationFormProps {
  onSubmit: (data: ReservationFormData) => void;
  status?: ReservationFormStatus;
  errorMessage?: string;
}

const INDUSTRY_OPTIONS = [
  '개발',
  '디자인',
  '기획/PM',
  '마케팅',
  '영업',
  '인사/총무',
  '재무/회계',
  '기타',
];

const EXPERIENCE_OPTIONS = [
  '1년 미만',
  '1-3년',
  '3-5년',
  '5-10년',
  '10년 이상',
];

export function ReservationForm({
  onSubmit,
  status = 'idle',
  errorMessage,
}: ReservationFormProps) {
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !industry || !experienceYears) return;
    onSubmit({ email, industry, experience_years: experienceYears });
  };

  if (isSuccess) {
    return (
      <section className="bg-white py-20 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            예약이 완료되었습니다!
          </h2>
          <p className="text-slate-500">
            첫 500명 안에 포함되셨습니다. 오픈 알림을 보내드릴게요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            지금 예약하세요
          </h2>
          <p className="text-slate-500">
            선착순 500명에게 베타 접근 권한을 드립니다
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reservation-email"
              className="text-sm font-medium text-slate-700"
            >
              이메일
            </label>
            <input
              id="reservation-email"
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 transition"
              aria-label="이메일"
            />
          </div>

          {/* 직군 */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reservation-industry"
              className="text-sm font-medium text-slate-700"
            >
              직군
            </label>
            <select
              id="reservation-industry"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 transition bg-white"
              aria-label="직군"
            >
              <option value="">직군을 선택하세요</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* 연차 */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reservation-experience"
              className="text-sm font-medium text-slate-700"
            >
              연차
            </label>
            <select
              id="reservation-experience"
              required
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 transition bg-white"
              aria-label="연차"
            >
              <option value="">연차를 선택하세요</option>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* 에러 메시지 */}
          {status === 'error' && errorMessage && (
            <p role="alert" className="text-red-600 text-sm">
              {errorMessage}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading || !email || !industry || !experienceYears}
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold text-base hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
                지금 예약하기
              </span>
            ) : (
              '지금 예약하기'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
