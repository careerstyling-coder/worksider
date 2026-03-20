'use client';

import { useState } from 'react';
import { AdminMenu } from '@/components/AdminMenu';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/ui';
import { Users, Activity, RefreshCcw, Clock, Search } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

const COLORS = ['#1877F2', '#31A24C', '#F7B928', '#9B59B6', '#8A8D91'];

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
  { name: '100~1,000인', value: 18 },
  { name: '1,000인+', value: 7 },
];

const cohortData = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  retention: Math.max(15, 75 - i * 7 + Math.floor(Math.random() * 8)),
}));

const mockUsers = [
  { id: '1', nickname: 'growth_hacker', email: 'kim@startup.io', industry: 'IT/소프트웨어', company_size: '5~30인', created_at: '2026-03-01' },
  { id: '2', nickname: 'fintech_pro', email: 'lee@bank.com', industry: '금융/보험', company_size: '1,000인+', created_at: '2026-02-28' },
  { id: '3', nickname: 'maker_jane', email: 'park@mfg.kr', industry: '제조/생산', company_size: '100~1,000인', created_at: '2026-02-25' },
  { id: '4', nickname: 'edu_leader', email: 'choi@edu.ac.kr', industry: '교육', company_size: '30~100인', created_at: '2026-02-20' },
  { id: '5', nickname: 'media_star', email: 'jung@media.co', industry: '미디어/엔터', company_size: '5~30인', created_at: '2026-02-15' },
];

export default function AdminUsersDemo() {
  const [search, setSearch] = useState('');

  const filtered = mockUsers.filter(u =>
    !search || u.nickname.includes(search) || u.email.includes(search)
  );

  return (
    <SidebarLayout sidebar={<AdminMenu activeRoute="/demo/phase-5/admin-users" basePath="/demo/phase-5" />}>
      <div className="p-6 bg-bg-page min-h-screen">
        <h1 className="text-2xl font-bold text-text-primary mb-6">사용자 관리</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="총 가입자" value={157} icon={<Users size={20} />} />
          <StatCard title="활성 (30일)" value={87} icon={<Activity size={20} />} />
          <StatCard title="재참여율" value="38%" icon={<RefreshCcw size={20} />} />
          <StatCard title="평균 세션" value="8.3분" icon={<Clock size={20} />} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-border p-5">
            <h3 className="text-[15px] font-semibold text-text-primary mb-4">산업군별 분포</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={industryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {industryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg border border-border p-5">
            <h3 className="text-[15px] font-semibold text-text-primary mb-4">회사 규모별 분포</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sizeData} layout="vertical">
                <XAxis type="number" stroke="#8A8D91" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#8A8D91" width={80} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="#1877F2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 검색 */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input type="text" placeholder="닉네임 또는 이메일 검색" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-md pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        {/* 사용자 테이블 */}
        <div className="bg-white rounded-lg border border-border overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-text-secondary border-b border-divider">
                <th className="px-4 py-3 font-medium">닉네임</th>
                <th className="px-4 py-3 font-medium">이메일</th>
                <th className="px-4 py-3 font-medium">산업</th>
                <th className="px-4 py-3 font-medium">규모</th>
                <th className="px-4 py-3 font-medium">가입일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-divider hover:bg-bg-hover transition">
                  <td className="px-4 py-3 text-[15px] font-medium text-text-primary">{u.nickname}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{u.industry}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{u.company_size}</td>
                  <td className="px-4 py-3 text-sm text-text-tertiary">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 코호트 */}
        <div className="bg-white rounded-lg border border-border p-5">
          <h3 className="text-[15px] font-semibold text-text-primary mb-4">코호트 분석 (주차별 재참여율)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cohortData}>
              <XAxis dataKey="week" stroke="#8A8D91" fontSize={12} />
              <YAxis stroke="#8A8D91" fontSize={12} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="retention" stroke="#1877F2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SidebarLayout>
  );
}
