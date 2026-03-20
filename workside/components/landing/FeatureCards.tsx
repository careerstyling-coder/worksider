'use client';

import { Dna, Share2, MessageCircle } from 'lucide-react';

const features = [
  { icon: Dna, title: 'DNA 진단', desc: '3분이면 충분해요. 나만의 업무 성향 4가지 축을 발견할 수 있어요.', color: 'text-primary bg-primary-light' },
  { icon: Share2, title: '공유 & 비교', desc: '내 결과를 동료에게 공유하면, 서로를 더 깊이 이해하게 돼요.', color: 'text-success bg-green-50' },
  { icon: MessageCircle, title: '정기 질문', desc: "매주 올라오는 질문에 답하며, '나라면 어떨까?'를 함께 고민해요.", color: 'text-warning bg-yellow-50' },
];

export default function FeatureCards() {
  return (
    <section data-testid="feature-cards" className="bg-bg-page py-16 px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold text-text-primary">함께 성장하는 방법</h2>
        <p className="mt-2 text-center text-text-secondary">Workside가 제안하는 세 가지 도구</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} data-testid={`feature-card-${i}`} className="rounded-lg border border-border bg-white p-6 hover:shadow-md transition-shadow">
              <div className={`inline-flex rounded-lg p-2.5 ${f.color}`}><f.icon size={22} /></div>
              <h3 className="mt-4 text-[17px] font-semibold text-text-primary">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
