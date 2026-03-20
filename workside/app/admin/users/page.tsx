'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminMenu } from '@/components/AdminMenu';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/ui';
import { Users, Activity, Search } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const INDUSTRY_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
const SIZE_COLORS = ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75'];

interface UserRow {
  id: string;
  nickname: string;
  email: string;
  industry: string | null;
  company_size: string | null;
  created_at: string;
}

interface ChartItem {
  name: string;
  value: number;
}

export default function AdminUsersPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [industryData, setIndustryData] = useState<ChartItem[]>([]);
  const [sizeData, setSizeData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (industryFilter) params.set('industry', industryFilter);

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.data) {
        setUsers(data.data.users);
        setTotalUsers(data.data.totalUsers);
        if (data.data.industryData) setIndustryData(data.data.industryData);
        if (data.data.sizeData) setSizeData(data.data.sizeData);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [search, industryFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Unique industries for filter dropdown
  const industries = industryData.map(d => d.name);

  return (
    <SidebarLayout sidebar={<AdminMenu activeRoute="/admin/users" />}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-6">사용자 관리</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="총 가입자" value={totalUsers} icon={<Users size={20} />} />
          <StatCard title="검색 결과" value={users.length} icon={<Activity size={20} />} />
        </div>

        {/* Charts */}
        {(industryData.length > 0 || sizeData.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {industryData.length > 0 && (
              <div className="bg-[#F7F8FA] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">산업군별 분포</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={industryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {industryData.map((_, i) => <Cell key={i} fill={INDUSTRY_COLORS[i % INDUSTRY_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {sizeData.length > 0 && (
              <div className="bg-[#F7F8FA] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">회사 규모별 분포</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sizeData} layout="vertical">
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="name" type="category" stroke="#666" width={70} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {sizeData.map((_, i) => <Cell key={i} fill={SIZE_COLORS[i % SIZE_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input type="text" placeholder="이메일 또는 닉네임 검색" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-bg-active text-text-primary rounded-lg pl-10 pr-4 py-2 text-sm" />
          </div>
          <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="bg-bg-active text-text-primary rounded-lg px-3 py-2 text-sm">
            <option value="">전체 산업</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* User Table */}
        <div className="bg-bg-page rounded-xl overflow-hidden mb-8">
          {loading ? (
            <p className="p-6 text-text-secondary text-center">로딩 중...</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-text-secondary text-center">등록된 사용자가 없습니다.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-text-secondary text-sm border-b border-border">
                  <th className="p-3">닉네임</th>
                  <th className="p-3">이메일</th>
                  <th className="p-3">산업</th>
                  <th className="p-3">규모</th>
                  <th className="p-3">가입일</th>
                </tr>
              </thead>
              <tbody className="text-text-primary text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-bg-active/50">
                    <td className="p-3">{u.nickname}</td>
                    <td className="p-3 text-text-secondary">{u.email}</td>
                    <td className="p-3">{u.industry || '-'}</td>
                    <td className="p-3">{u.company_size || '-'}</td>
                    <td className="p-3 text-text-secondary">{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
