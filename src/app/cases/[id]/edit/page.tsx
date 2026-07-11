"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import { Priority } from '@/types';
import { ReviewStatus } from '@/components/ui/HumanApprovalBadge';

const LEGACY_SUBSIDY_CASE_TYPES = new Set<string>([
  '補助金制度調査',
  '公募要項・要網整理',
  '公募要項・要綱整理',
  '補助金申請準備',
  '補助金進捗管理',
]);

const normalizeSubsidyCaseTypeForForm = (caseType: string): string => {
  return LEGACY_SUBSIDY_CASE_TYPES.has(caseType) ? '補助金支援' : caseType;
};

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const { cases, updateCase } = useCases();

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [caseType, setCaseType] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState('');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('pending_review');
  const [employeeCount, setEmployeeCount] = useState('未確認');
  const [industry, setIndustry] = useState('未確認');
  const [clientContactPerson, setClientContactPerson] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (isInitialized) return;

    const existingCase = cases.find(c => c.id === caseId);
    if (existingCase) {
      setTitle(existingCase.title);
      setClientName(existingCase.clientName);
      setCaseType(normalizeSubsidyCaseTypeForForm(existingCase.caseType));
      setDueDate(existingCase.dueDate);
      setPriority(existingCase.priority);
      setAssignee(existingCase.assignee);
      setEmployeeCount(existingCase.employeeCount || '未確認');
      setIndustry(existingCase.industry || '未確認');
      setClientContactPerson(existingCase.clientContactPerson || '');
      setReviewStatus(existingCase.reviewStatus);
      setMemo(existingCase.memo || '');
      setIsLoading(false);
      setIsInitialized(true);
    } else {
      // Give it a brief moment to load cases from localStorage
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cases, caseId, isInitialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) {
      alert("案件名と顧問先は必須です");
      return;
    }

    updateCase(caseId, {
      title,
      clientName,
      caseType,
      dueDate,
      priority,
      assignee,
      industry,
      employeeCount,
      clientContactPerson,
      reviewStatus,
      memo,
    });

    router.push(`/cases/${caseId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <p className="text-slate-500">案件データを読み込み中...</p>
      </div>
    );
  }

  if (!title && !isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <p className="text-slate-500">案件が見つかりません。</p>
        <Link href="/cases" className="text-indigo-600 hover:underline mt-4 inline-block">一覧へ戻る</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/cases/${caseId}`} className="text-slate-500 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">案件情報の編集</h1>
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
                  <option value="補助金支援">補助金支援</option>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">担当者</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={assignee} onChange={e => setAssignee(e.target.value)}>
                  <option value="山田太郎">山田太郎</option>
                  <option value="佐藤花子">佐藤花子</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">確認状況</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={reviewStatus} onChange={e => setReviewStatus(e.target.value as ReviewStatus)}>
                  <option value="pending_review">レビュー待ち</option>
                  <option value="assignee_confirmed">担当者確認済</option>
                  <option value="expert_confirmed">専門家確認済</option>
                  <option value="delivered">納品済</option>
                </select>
              </div>
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
            <Link href={`/cases/${caseId}`} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
              キャンセル
            </Link>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
