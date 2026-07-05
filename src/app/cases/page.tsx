"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import HumanApprovalBadge from '@/components/ui/HumanApprovalBadge';
import { useCases } from '@/hooks/useCases';

export default function CasesListPage() {
  const { cases } = useCases();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredCases = cases.filter(c => {
    const matchStatus = filterStatus === 'all' || c.reviewStatus === filterStatus;
    const matchSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-soft-enter">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">案件一覧</h1>
          <p className="text-sm text-slate-500 mt-1">すべての進行中および完了した案件</p>
        </div>
        <Link href="/cases/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-soft hover-lift shadow-sm">
          ＋ 新規案件作成
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="案件名、顧問先で検索..." 
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">すべてのステータス</option>
            <option value="pending_review">レビュー待ち</option>
            <option value="assignee_confirmed">担当者確認済</option>
            <option value="expert_confirmed">専門家確認済</option>
            <option value="delivered">納品済</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                <th className="p-4 font-semibold">案件名 / 顧問先</th>
                <th className="p-4 font-semibold">案件種別</th>
                <th className="p-4 font-semibold">納期 / 優先度</th>
                <th className="p-4 font-semibold">担当者</th>
                <th className="p-4 font-semibold">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-soft">
                  <td className="p-4">
                    <Link href={`/cases/${c.id}`} className="font-bold text-indigo-600 hover:underline block mb-1">
                      {c.title}
                    </Link>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded mr-2">
                      {c.clientName}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({c.industry} / {c.employeeCount})
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-700">{c.caseType}</td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-800">{c.dueDate}</div>
                    <div className={`text-xs mt-1 font-medium ${c.priority === 'high' ? 'text-red-600' : c.priority === 'medium' ? 'text-amber-600' : 'text-slate-500'}`}>
                      {c.priority === 'high' ? '優先度: 高' : c.priority === 'medium' ? '優先度: 中' : '優先度: 低'}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-700">{c.assignee}</td>
                  <td className="p-4">
                    <HumanApprovalBadge status={c.reviewStatus} readOnly />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
