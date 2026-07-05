"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import Disclaimer from '@/components/ui/Disclaimer';
import HumanApprovalBadge from '@/components/ui/HumanApprovalBadge';
import { useCases } from '@/hooks/useCases';

export default function Dashboard() {
  const { cases, isLoaded } = useCases();

  // isLoadedがfalseの間はstatsをレンダリングしない（Hydration mismatch防止）
  const stats = useMemo(() => {
    if (!isLoaded) return { overdueOrToday: '-', pendingReview: '-', inProgressMe: '-', expertConfirmed: '-', delivered: '-' };
    const today = new Date().toISOString().split('T')[0];
    
    let overdueOrToday = 0;
    let pendingReview = 0;
    let inProgressMe = 0;
    let expertConfirmed = 0;
    let delivered = 0;

    cases.forEach(c => {
      if (c.reviewStatus === 'delivered') {
        delivered++;
      } else {
        if (c.dueDate && c.dueDate <= today) {
          overdueOrToday++;
        }
        if (c.reviewStatus === 'pending_review') {
          pendingReview++;
        }
        if (c.assignee === '山田太郎') {
          inProgressMe++;
        }
        if (c.reviewStatus === 'expert_confirmed') {
          expertConfirmed++;
        }
      }
    });

    return { overdueOrToday, pendingReview, inProgressMe, expertConfirmed, delivered };
  }, [cases, isLoaded]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">ダッシュボード</h1>
        <Link href="/cases/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          ＋ 新規案件作成
        </Link>
      </div>

      <Disclaimer />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-700">進行中の案件（最近の更新）</h2>
            <Link href="/cases" className="text-sm text-indigo-600 hover:underline font-medium">すべて見る →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {cases.slice(0, 3).map((c) => (
              <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                      {c.clientName}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {c.caseType}
                    </span>
                    {c.priority === 'high' && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                        優先度: 高
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">納期: {c.dueDate}</div>
                </div>
                <Link href={`/cases/${c.id}`} className="block">
                  <h3 className="font-bold text-slate-800 hover:text-indigo-600 transition-colors text-lg mb-1">{c.title}</h3>
                </Link>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {c.assignee}
                    </div>
                  </div>
                  <HumanApprovalBadge status={c.reviewStatus} readOnly />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">タスクサマリー</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100 text-red-700">
                <span className="font-medium text-sm">期限切れ・本日期限</span>
                <span className="text-xl font-bold">{stats.overdueOrToday}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-700">
                <span className="font-medium text-sm">レビュー待ち</span>
                <span className="text-xl font-bold">{stats.pendingReview}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-700">
                <span className="font-medium text-sm">進行中（自分）</span>
                <span className="text-xl font-bold">{stats.inProgressMe}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100 text-green-700">
                <span className="font-medium text-sm">専門家確認済</span>
                <span className="text-xl font-bold">{stats.expertConfirmed}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                <span className="font-medium text-sm">納品済</span>
                <span className="text-xl font-bold">{stats.delivered}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
