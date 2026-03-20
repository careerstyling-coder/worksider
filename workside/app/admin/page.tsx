'use client';

import { useEffect, useState } from 'react';
import { AdminMenu } from '@/components/AdminMenu';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { StatCard } from '@/components/ui';
import { BarChart3, Users, Share2, Activity, Save } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface DashboardStats {
  dnaCompleted: number;
  questionResponses: number;
  shareClicks: number;
  activeUsers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ dnaCompleted: 0, questionResponses: 0, shareClicks: 0, activeUsers: 0 });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [trendData, setTrendData] = useState<{ date: string; count: number }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch real stats from DB
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setStats({
            dnaCompleted: d.data.dnaCompleted,
            questionResponses: d.data.questionResponses,
            shareClicks: d.data.shareClicks,
            activeUsers: d.data.totalUsers,
          });
          if (d.data.trendData) {
            setTrendData(d.data.trendData);
          }
        }
      })
      .catch(() => {});
    // Fetch settings
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.data) {
        const map: Record<string, string> = {};
        d.data.forEach((s: any) => { map[s.key] = s.value; });
        setSettings(map);
      }
    }).catch(() => {});
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
    }
    setSaving(false);
  };

  return (
    <SidebarLayout sidebar={<AdminMenu activeRoute="/admin" />}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-6">대시보드</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="DNA 진단 완료" value={stats.dnaCompleted} icon={<BarChart3 size={20} />} />
          <StatCard title="질문 참여" value={stats.questionResponses} icon={<Activity size={20} />} />
          <StatCard title="공유 클릭" value={stats.shareClicks} icon={<Share2 size={20} />} />
          <StatCard title="활성 사용자 (DAU)" value={stats.activeUsers} icon={<Users size={20} />} />
        </div>

        {/* DNA Trend Chart */}
        <div className="bg-[#F7F8FA] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">DNA 진단 추세 (14일)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Settings Panel */}
        <div className="bg-[#F7F8FA] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">설정</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-text-secondary block mb-2">가입 게이트 위치</label>
              <div className="flex gap-3">
                {['result', 'question', 'feed'].map((loc) => (
                  <label key={loc} className="flex items-center gap-2 text-sm text-text-primary">
                    <input type="radio" name="gate" checked={settings.gate_location === loc} onChange={() => setSettings(s => ({ ...s, gate_location: loc }))} />
                    {loc}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-2">질문 배포 주기</label>
              <select
                value={settings.question_distribution || 'weekly'}
                onChange={(e) => setSettings(s => ({ ...s, question_distribution: e.target.value }))}
                className="bg-bg-active text-text-primary rounded px-3 py-2 text-sm"
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="biweekly">격주</option>
              </select>
            </div>
            <button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm text-white disabled:opacity-50">
              <Save size={16} /> {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
