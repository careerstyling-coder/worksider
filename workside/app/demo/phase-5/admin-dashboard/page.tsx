'use client';

import { useState } from 'react';
import { AdminMenu } from '@/components/AdminMenu';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/ui';
import { BarChart3, Users, Activity, RefreshCcw, Save, Search } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from 'recharts';

const trendData = Array.from({ length: 14 }, (_, i) => ({
  date: `${i + 1}일`,
  진단: Math.floor(Math.random() * 20) + 5,
  참여: Math.floor(Math.random() * 30) + 10,
}));

const engagementData = [
  { name: '업무 소통 방식', value: 156 },
  { name: '리더십 스타일', value: 124 },
  { name: '재택 vs 출근', value: 98 },
  { name: '회의 빈도', value: 87 },
  { name: '성장 기회', value: 72 },
];

const industryData = [
  { name: 'IT/소프트웨어', value: 45 },
  { name: '금융/보험', value: 25 },
  { name: '제조/생산', value: 15 },
  { name: '서비스업', value: 10 },
  { name: '기타', value: 5 },
];

const sizeData = [
  { name: '5인 이하', value: 12 },
  { name: '5~30인', value: 28 },
  { name: '30~100인', value: 35 },
  { name: '100~1K', value: 18 },
  { name: '1K+', value: 7 },
];

const cohortData = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  retention: Math.max(15, 75 - i * 7 + Math.floor(Math.random() * 8)),
}));

const COLORS = ['#1877F2', '#31A24C', '#F7B928', '#9B59B6', '#8A8D91'];

const mockUsers = [
  { id: '1', nickname: 'growth_hacker', email: 'kim@startup.io', industry: 'IT/소프트웨어', size: '5~30인', created: '03-01', dna: 3, act: 12 },
  { id: '2', nickname: 'fintech_pro', email: 'lee@bank.com', industry: '금융/보험', size: '1,000인+', created: '02-28', dna: 1, act: 8 },
  { id: '3', nickname: 'maker_jane', email: 'park@mfg.kr', industry: '제조/생산', size: '100~1K', created: '02-25', dna: 2, act: 15 },
  { id: '4', nickname: 'edu_leader', email: 'choi@edu.ac.kr', industry: '교육', size: '30~100인', created: '02-20', dna: 1, act: 5 },
  { id: '5', nickname: 'media_star', email: 'jung@media.co', industry: '미디어/엔터', size: '5~30인', created: '02-15', dna: 4, act: 22 },
];

export default function AdminDashboardUnified() {
  const [gate, setGate] = useState('result');
  const [dist, setDist] = useState('weekly');
  const [search, setSearch] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const filtered = mockUsers.filter(u => !search || u.nickname.includes(search) || u.email.includes(search));

  return (
    <SidebarLayout sidebar={<AdminMenu activeRoute="/demo/phase-5/admin-dashboard" basePath="/demo/phase-5" />}>
      <div className="p-5 bg-bg-page min-h-screen space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">대시보드</h1>
          <button onClick={() => setShowSettings(!showSettings)} className="text-sm text-text-secondary hover:text-primary transition flex items-center gap-1">
            <Save size={14} /> {showSettings ? '설정 닫기' : '설정'}
          </button>
        </div>

        {/* 설정 (접이식) */}
        {showSettings && (
          <section className="bg-white rounded-lg border border-border p-5">
            <h2 className="text-[15px] font-semibold text-text-primary mb-4">서비스 설정</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-text-secondary block mb-2">가입 게이트 위치</label>
                <div className="flex gap-3">
                  {['result', 'question', 'feed'].map(loc => (
                    <label key={loc} className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                      <input type="radio" name="gate" checked={gate === loc} onChange={() => setGate(loc)} className="accent-primary" />{loc}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary block mb-2">질문 배포 주기</label>
                <select value={dist} onChange={(e) => setDist(e.target.value)} className="bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="biweekly">격주</option>
                </select>
              </div>
            </div>
            <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm text-white transition"><Save size={14} /> 저장</button>
          </section>
        )}

        {/* 1. 서비스 현황 */}
        <section>
          <h2 className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">서비스 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="총 가입자" value={157} icon={<Users size={18} />} />
            <StatCard title="활성 (30일)" value={87} icon={<Activity size={18} />} />
            <StatCard title="DNA 진단" value={243} icon={<BarChart3 size={18} />} />
            <StatCard title="재참여율" value="38%" icon={<RefreshCcw size={18} />} />
          </div>
        </section>

        {/* 2. 참여 & 추세 */}
        <section>
          <h2 className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">참여 & 추세</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-border p-5">
              <h3 className="text-[15px] font-semibold text-text-primary mb-3">진단 & 참여 추세 (14일)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" stroke="#8A8D91" fontSize={11} />
                  <YAxis stroke="#8A8D91" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #CED0D4', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="진단" stroke="#1877F2" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="참여" stroke="#31A24C" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                <span className="flex items-center gap-1 text-xs text-text-secondary"><span className="w-2 h-2 rounded-full bg-[#1877F2]" />진단</span>
                <span className="flex items-center gap-1 text-xs text-text-secondary"><span className="w-2 h-2 rounded-full bg-[#31A24C]" />참여</span>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-border p-5">
              <h3 className="text-[15px] font-semibold text-text-primary mb-3">질문별 참여도 Top 5</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={engagementData} layout="vertical">
                  <XAxis type="number" stroke="#8A8D91" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#8A8D91" width={90} fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1877F2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 3. 사용자 구성 */}
        <section>
          <h2 className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">사용자 구성</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">산업군별</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={industryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}
                    label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {industryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-center">
                {industryData.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1 text-[10px] text-text-tertiary">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />{d.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">회사규모별</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={sizeData} layout="vertical">
                  <XAxis type="number" stroke="#8A8D91" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#8A8D91" width={50} fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1877F2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">코호트 (주차별 재참여)</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={cohortData}>
                  <XAxis dataKey="week" stroke="#8A8D91" fontSize={10} />
                  <YAxis stroke="#8A8D91" fontSize={10} unit="%" />
                  <Tooltip />
                  <Line type="monotone" dataKey="retention" stroke="#1877F2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 4. 사용자 목록 */}
        <section>
          <h2 className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">사용자 목록</h2>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input type="text" placeholder="닉네임 또는 이메일 검색" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-border rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-text-secondary border-b border-divider">
                  <th className="px-3 py-2.5 font-medium">닉네임</th>
                  <th className="px-3 py-2.5 font-medium">산업</th>
                  <th className="px-3 py-2.5 font-medium">규모</th>
                  <th className="px-3 py-2.5 font-medium">진단</th>
                  <th className="px-3 py-2.5 font-medium">참여</th>
                  <th className="px-3 py-2.5 font-medium">가입</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-divider hover:bg-bg-hover transition">
                    <td className="px-3 py-2.5">
                      <span className="text-sm font-medium text-text-primary">{u.nickname}</span>
                      <span className="block text-[10px] text-text-tertiary">{u.email}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-text-secondary">{u.industry}</td>
                    <td className="px-3 py-2.5 text-xs text-text-secondary">{u.size}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-text-primary">{u.dna}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-text-primary">{u.act}</td>
                    <td className="px-3 py-2.5 text-xs text-text-tertiary">{u.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SidebarLayout>
  );
}
