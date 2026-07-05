"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import { Case, Priority } from '@/types';

export default function NewCasePage() {
  const router = useRouter();
  const { addCase } = useCases();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [caseType, setCaseType] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState('山田太郎');
  const [employeeCount, setEmployeeCount] = useState('未確認');
  const [industry, setIndustry] = useState('未確認');
  const [clientContactPerson, setClientContactPerson] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) {
      alert("案件名と顧問先は必須です");
      return;
    }

    const newCaseId = `case_${Date.now()}`;
    const newCase: Case = {
      id: newCaseId,
      title,
      clientName,
      caseType,
      dueDate,
      priority,
      assignee,
      industry,
      employeeCount,
      clientContactPerson,
      reviewStatus: 'pending_review',
      progressStatus: 'hearing',
      memo,
      createdAt: new Date().toISOString().split('T')[0],
      extractedItems: [],
    };

    addCase(newCase);
    router.push(`/cases/${newCaseId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cases" className="text-slate-500 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">新規案件の作成</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">案件名 <span className="text-red-500">*</span></label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="例: 就業規則改訂" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">顧問先 <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={clientName} onChange={e => setClientName(e.target.value)} required>
                  <option value="">-- 選択してください --</option>
                  <option value="A社（匿名）">A社（匿名）</option>
                  <option value="B株式会社（匿名）">B株式会社（匿名）</option>
                  <option value="C合同会社（匿名）">C合同会社（匿名）</option>
                  <option value="新規顧問先（テスト）">+ 新規顧問先を登録</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">※ 顧問先名は匿名管理されます</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">案件種別</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={caseType} onChange={e => setCaseType(e.target.value)}>
                  <option value="">-- 選択してください --</option>
                  <option value="就業規則改訂">就業規則改訂</option>
                  <option value="賃金規程">賃金規程</option>
                  <option value="育児介護休業規程">育児介護休業規程</option>
                  <option value="労務相談">労務相談</option>
                  <option value="税務相談">税務相談</option>
                  <option value="その他">その他</option>
                  <optgroup label="補助金関連">
                    <option value="補助金支援">補助金支援</option>
                    <option value="補助金制度調査">補助金制度調査</option>
                    <option value="公募要項・要網整理">公募要項・要網整理</option>
                    <option value="補助金申請準備">補助金申請準備</option>
                    <option value="補助金進捗管理">補助金進捗管理</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">納期</label>
                <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">優先度</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">担当者</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={assignee} onChange={e => setAssignee(e.target.value)}>
                <option value="山田太郎">山田太郎</option>
                <option value="佐藤花子">佐藤花子</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">従業員数</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={employeeCount} onChange={e => setEmployeeCount(e.target.value)}>
                  <option value="1〜9名">1〜9名</option>
                  <option value="10〜29名">10〜29名</option>
                  <option value="30〜49名">30〜49名</option>
                  <option value="50〜99名">50〜99名</option>
                  <option value="100〜299名">100〜299名</option>
                  <option value="300名以上">300名以上</option>
                  <option value="未確認">未確認</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">業種</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={industry} onChange={e => setIndustry(e.target.value)}>
                  <option value="医療・福祉">医療・福祉</option>
                  <option value="建設業">建設業</option>
                  <option value="製造業">製造業</option>
                  <option value="小売業">小売業</option>
                  <option value="飲食業">飲食業</option>
                  <option value="IT・情報通信">IT・情報通信</option>
                  <option value="士業・専門サービス">士業・専門サービス</option>
                  <option value="教育">教育</option>
                  <option value="不動産">不動産</option>
                  <option value="その他">その他</option>
                  <option value="未確認">未確認</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">案件先の担当者</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="例: 総務部 田中様" value={clientContactPerson} onChange={e => setClientContactPerson(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">メモ</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="案件に関する特記事項など" value={memo} onChange={e => setMemo(e.target.value)}></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Link href="/cases" className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
              キャンセル
            </Link>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              作成する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
