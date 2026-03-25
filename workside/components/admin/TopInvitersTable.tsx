// @TASK P4-S5-T1 - 상위 초대자 테이블 컴포넌트
'use client';

import React from 'react';

export interface InviterRow {
  rank: number;
  email: string;
  successful_invites: number;
  conversion_rate: number;
}

export interface TopInvitersTableProps {
  inviters: InviterRow[];
}

export function TopInvitersTable({ inviters }: TopInvitersTableProps) {
  const displayInviters = inviters.slice(0, 10);

  return (
    <div
      data-testid="top-inviters-table"
      className="bg-bg-secondary border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-sm font-semibold text-white/70 mb-4">상위 초대자 TOP 10</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-3 text-white/50 font-medium">순위</th>
              <th className="text-left py-2 px-3 text-white/50 font-medium">이메일</th>
              <th className="text-right py-2 px-3 text-white/50 font-medium">초대 수</th>
              <th className="text-right py-2 px-3 text-white/50 font-medium">전환율</th>
            </tr>
          </thead>
          <tbody>
            {displayInviters.map((inviter) => (
              <tr
                key={inviter.rank}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-2.5 px-3 text-white/60">{inviter.rank}</td>
                <td className="py-2.5 px-3 text-white">{inviter.email}</td>
                <td className="py-2.5 px-3 text-right text-white font-medium">
                  {inviter.successful_invites}
                </td>
                <td className="py-2.5 px-3 text-right text-accent-neon font-semibold">
                  {Math.round(inviter.conversion_rate * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
