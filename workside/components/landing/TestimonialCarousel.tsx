'use client';

const testimonials = [
  { name: 'growth_hacker', role: '스타트업 PM', text: '3분 만에 제 업무 스타일을 정확히 짚어줬어요. 동료들과 공유하니 서로를 이해하는 데 큰 도움이 됐습니다.' },
  { name: 'dev_master', role: '대기업 개발자', text: '정기 질문에 참여하면서 다른 직군 사람들의 시각을 알게 됐어요. 시야가 넓어지는 느낌입니다.' },
  { name: 'mkt_queen', role: '금융권 마케터', text: '페르소나별 분석이 인상 깊었어요. 소수 의견 인사이트가 실무에 큰 도움이 됩니다.' },
  { name: 'free_creator', role: '프리랜서 디자이너', text: '자율형 독립가라는 결과가 정말 공감됐어요. 자기 이해의 좋은 출발점이었습니다.' },
];

export default function TestimonialCarousel() {
  return (
    <section data-testid="testimonial-section" className="bg-white py-16 px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold text-text-primary">함께 성장하는 사람들의 이야기</h2>
        <p className="mt-2 text-center text-text-secondary">먼저 경험한 분들이 들려주는 이야기</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {testimonials.map((t, i) => (
            <div key={i} data-testid={`testimonial-card-${i}`} className="rounded-lg border border-border bg-white p-5">
              <p className="text-[15px] leading-relaxed text-text-primary">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary-light flex items-center justify-center text-sm font-bold text-primary">{t.name[0]}</div>
                <div>
                  <p data-testid="testimonial-name" className="text-[15px] font-semibold text-text-primary">{t.name}</p>
                  <p className="text-[13px] text-text-secondary">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
