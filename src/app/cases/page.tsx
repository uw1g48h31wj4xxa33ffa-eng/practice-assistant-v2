"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import HumanApprovalBadge from '@/components/ui/HumanApprovalBadge';
import Chip from '@/components/ui/Chip';
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">案件一覧</h1>
          <p className="text-sm text-slate-500 mt-1">すべての進行中および完了した案件</p>
        </div>
        <Link href="/cases/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-soft hover-lift shadow-sm text-center">
          ＋ 新規案件作成
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-3 md:gap-4">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="案件名、顧問先で検索..." 
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
          />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
          >
            <option value="all">すべてのステータス</option>
            <option value="pending_review">レビュー待ち</option>
            <option value="assignee_confirmed">担当者確認済</option>
            <option value="expert_confirmed">専門家確認済</option>
            <option value="delivered">納品済</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                <th className="p-4 font-semibold">案件名 / 顧問先</th>
                <th className="p-4 font-semibold">案件種別</th>
                <th className="p-4 font-semibold">納期 / 優先度</th>
                <th className="p-4 font-semibold">担当者</th>
                <th className="p-4 font-semibold">ステータス</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-slate-100">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-soft block md:table-row p-4 md:p-0">
                  <td className="block md:table-cell px-0 py-1.5 md:p-4">
                    <Link href={`/cases/${c.id}`} className="font-bold text-indigo-600 hover:underline block mb-1">
                      {c.title}
                    </Link>
                    <Chip label={c.clientName} color="slate" variant="subtle" size="xs" className="mr-2 font-normal" />
                    <span className="text-xs text-slate-400">
                      ({c.industry} / {c.employeeCount})
                    </span>
                  </td>
                  <td className="block md:table-cell px-0 py-1 md:p-4 text-sm text-slate-700">
                    <span className="md:hidden text-xs text-slate-400 mr-2">種別:</span>{c.caseType}
                  </td>
                  <td className="block md:table-cell px-0 py-1 md:p-4">
                    <div className="text-sm font-medium text-slate-800 flex items-center md:block">
                      <span className="md:hidden text-xs text-slate-400 mr-2 font-normal">納期:</span>{c.dueDate}
                    </div>
                    <div className={`text-xs mt-0.5 md:mt-1 font-medium flex items-center md:block ${c.priority === 'high' ? 'text-red-600' : c.priority === 'medium' ? 'text-amber-600' : 'text-slate-500'}`}>
                      <span className="md:hidden text-xs text-slate-400 mr-2 font-normal">優先度:</span>
                      {c.priority === 'high' ? '高' : c.priority === 'medium' ? '中' : '低'}
                    </div>
                  </td>
                  <td className="block md:table-cell px-0 py-1 md:p-4 text-sm text-slate-700">
                    <span className="md:hidden text-xs text-slate-400 mr-2">担当:</span>{c.assignee}
                  </td>
                  <td className="block md:table-cell px-0 pt-2 pb-1 md:p-4">
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
