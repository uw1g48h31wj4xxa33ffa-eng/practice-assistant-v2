"use client";

import React, { useState, use, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import ScheduleVerificationCard from '@/components/features/ai/ScheduleVerificationCard';
import { SubsidyScheduleItem, ScheduleVerificationStatus, ScheduleProgressStatus } from '@/types';

const mockScheduleItems: SubsidyScheduleItem[] = [
  { id: 's1', title: '公募開始', dueDate: '2024年4月1日', category: '公募スケジュール', importance: 'medium', verificationStatus: 'unverified', progressStatus: 'done', aiMemo: 'すでに開始済み' },
  { id: 's2', title: '申請締切', dueDate: '2024年5月31日', category: '公募スケジュール', importance: 'high', verificationStatus: 'unverified', progressStatus: 'not_started', aiMemo: '17:00必着。jGrantsでの電子申請。' },
  { id: 's3', title: '必要資料回収期限', dueDate: '2024年5月10日', category: '社内スケジュール', importance: 'high', verificationStatus: 'unverified', progressStatus: 'in_progress', aiMemo: '決算書、履歴事項全部証明書などの回収', riskNote: '現在クライアントに依頼中だが一部遅延の可能性あり' },
  { id: 's4', title: '見積書取得期限', dueDate: '2024年5月15日', category: '社内スケジュール', importance: 'high', verificationStatus: 'unverified', progressStatus: 'not_started', aiMemo: 'ベンダーからの正式見積書取得' },
  { id: 's5', title: '事業計画書（ドラフト）完成', dueDate: '2024年5月20日', category: '社内スケジュール', importance: 'high', verificationStatus: 'unverified', progressStatus: 'not_started', aiMemo: '作成後、すぐに専門家確認へ回すこと' },
  { id: 's6', title: '専門家確認期限', dueDate: '2024年5月25日', category: '社内スケジュール', importance: 'medium', verificationStatus: 'unverified', progressStatus: 'not_started', aiMemo: '外部社労士・中小企業診断士によるレビュー' },
  { id: 's7', title: '最終提出・申請日', dueDate: '2024年5月28日', category: '提出スケジュール', importance: 'high', verificationStatus: 'unverified', progressStatus: 'not_started', aiMemo: '締切3日前には提出を完了させる目標' }
];

export default function SubsidySchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: caseId } = use(params);
  const { getCaseById, updateCase } = useCases();
  
  const initialCase = getCaseById(caseId);

  // 初期表示ではローカルstateにモックデータを持たせる
  const [items, setItems] = useState<SubsidyScheduleItem[]>(() => {
    if (initialCase?.subsidyScheduleItems && initialCase.subsidyScheduleItems.length > 0) {
      return initialCase.subsidyScheduleItems;
    }
    return mockScheduleItems;
  });

  const pendingScrollRef = useRef<string | null>(null);

  useEffect(() => {
    if (pendingScrollRef.current) {
      const targetId = pendingScrollRef.current;
      pendingScrollRef.current = null;
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [items]);

  const isCompletedItem = (item: SubsidyScheduleItem) => {
    if (item.verificationStatus === 'verified' && item.progressStatus === 'done') return true;
    if (item.verificationStatus === 'rejected') return true;
    return false;
  };

  const handleStatusChange = (
    id: string, 
    newVerificationStatus: ScheduleVerificationStatus, 
    newProgressStatus?: ScheduleProgressStatus, 
    newNotes?: string, 
    newRiskNote?: string
  ) => {
    const nextItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          verificationStatus: newVerificationStatus,
          progressStatus: newProgressStatus !== undefined ? newProgressStatus : item.progressStatus,
          notes: newNotes !== undefined ? newNotes : item.notes,
          riskNote: newRiskNote !== undefined ? newRiskNote : item.riskNote,
        };
      }
      return item;
    });

    const currentVerifiedCount = items.filter(isCompletedItem).length;
    const isAllVerified = items.length > 0 && currentVerifiedCount === items.length;

    const nextVerifiedCount = nextItems.filter(isCompletedItem).length;
    const nextIsAllVerified = nextItems.length > 0 && nextVerifiedCount === nextItems.length;

    const currentItem = items.find(i => i.id === id);
    const justActioned = currentItem && 
      (currentItem.verificationStatus !== 'verified' && currentItem.verificationStatus !== 'rejected') && 
      (newVerificationStatus === 'verified' || newVerificationStatus === 'rejected');

    if (nextIsAllVerified && !isAllVerified) {
      pendingScrollRef.current = 'completion-area';
    } else if (justActioned) {
      const currentIndex = items.findIndex(item => item.id === id);
      let nextUncompleted = nextItems.slice(currentIndex + 1).find(item => !isCompletedItem(item));
      if (!nextUncompleted) {
        nextUncompleted = nextItems.slice(0, currentIndex).find(item => !isCompletedItem(item));
      }
      if (nextUncompleted) {
        pendingScrollRef.current = `card-${nextUncompleted.id}`;
      }
    }

    setItems(nextItems);
  };

  const handleSaveAndNext = () => {
    if (!initialCase) return;
    
    // updateCaseでローカルstateのデータを保存しつつ、次工程へ進む
    updateCase(caseId, {
      subsidyScheduleItems: items,
      progressStatus: 'delivery_prep'
    });
    router.push(`/cases/${caseId}/subsidy-delivery`);
  };

  const handleSaveDraft = () => {
    if (!initialCase) return;
    updateCase(caseId, {
      subsidyScheduleItems: items
    });
    alert('確認状況を保存しました。');
  };

  if (!initialCase) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <p className="text-slate-500">案件データを読み込み中、または見つかりませんでした...</p>
        <Link href="/cases" className="text-indigo-600 hover:underline mt-4 inline-block">一覧へ戻る</Link>
      </div>
    );
  }

  // 完了判定: (verified かつ done) または rejected が対象


  const verifiedCount = items.filter(isCompletedItem).length;
  const isAllVerified = items.length > 0 && verifiedCount === items.length;

  // 遅延・要注意のアイテムをリストアップ
  const attentionItems = items.filter(
    i => i.progressStatus === 'delayed' || i.progressStatus === 'at_risk'
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-soft-enter flex flex-col md:block">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4 order-1 md:order-none">
        <div className="flex items-center gap-4">
          <Link href={`/cases/${caseId}`} className="text-slate-500 hover:text-indigo-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">スケジュール管理</h1>
        </div>
      </div>

      {/* 案件情報サマリー */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6 order-4 md:order-none">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">案件情報サマリー</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-slate-400 mb-1">案件名</div>
            <div className="font-bold text-slate-700">{initialCase.title}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">顧問先</div>
            <div className="font-bold text-slate-700">{initialCase.clientName}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">業種・規模</div>
            <div className="font-bold text-slate-700">{initialCase.industry} / {initialCase.employeeCount}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">担当者・納期</div>
            <div className="font-bold text-slate-700">{initialCase.assignee} ({initialCase.dueDate})</div>
          </div>
        </div>

        {/* 前工程情報の引き継ぎ */}
        {(initialCase.subsidyGuidelineItems || initialCase.subsidyDocumentItems) && (
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {initialCase.subsidyGuidelineItems && initialCase.subsidyGuidelineItems.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 mb-2">公募要項サマリー</h3>
                <div className="flex flex-wrap gap-2">
                  {initialCase.subsidyGuidelineItems.filter(i => i.status === 'verified').slice(0, 3).map(item => (
                    <div key={item.id} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-600">
                      <span className="font-bold">{item.category}:</span>
                      <span className="truncate max-w-[120px]">{item.content}</span>
                    </div>
                  ))}
                  {initialCase.subsidyGuidelineItems.filter(i => i.status === 'verified').length > 3 && (
                    <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-500">
                      他 {initialCase.subsidyGuidelineItems.filter(i => i.status === 'verified').length - 3} 件
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {initialCase.subsidyDocumentItems && initialCase.subsidyDocumentItems.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 mb-2">資料準備状況</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex flex-col">
                    <span className="text-slate-500 mb-0.5">準備完了</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {initialCase.subsidyDocumentItems.filter(i => i.preparationStatus === 'prepared' && i.status === 'verified').length}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 mb-0.5">不足・準備中</span>
                    <span className="font-bold text-rose-600 text-sm">
                      {initialCase.subsidyDocumentItems.filter(i => i.preparationStatus === 'missing' || i.preparationStatus === 'pending').length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* スケジュールリスト (AI抽出結果) */}
      <div className="space-y-4 order-2 md:order-none">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              スケジュール項目（AI整理）
            </h2>
            <p className="text-sm text-slate-500 mt-1">AIが前工程の情報を元にスケジュールを整理しました。各項目の進行状況を確認してください。</p>
          </div>
          <div className="text-sm font-bold text-slate-500">
            確認進捗: {verifiedCount} / {items.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} id={`card-${item.id}`} className="scroll-mt-24">
              <ScheduleVerificationCard 
                item={item} 
                onStatusChange={handleStatusChange} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* 要確認・遅延リスク欄 */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 mt-8 order-3 md:order-none">
        <h2 className="text-lg font-bold text-rose-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          要確認・遅延リスク
        </h2>
        {attentionItems.length > 0 ? (
          <ul className="space-y-2">
            {attentionItems.map(item => (
              <li key={item.id} className="flex items-start gap-2 text-rose-900 text-sm">
                <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-bold">{item.title} （期限: {item.dueDate}）</span>
                  <span className="text-rose-700 text-xs mt-0.5">
                    {item.progressStatus === 'delayed' ? '進行が遅延しています。' : '要注意項目です。'}
                    {item.riskNote ? ` ${item.riskNote}` : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-rose-700">現在、遅延または要注意のスケジュールはありません。</p>
        )}
      </div>

      {/* 完了アクション */}
      <div id="completion-area" className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 mt-8 lg:flex-row lg:items-center lg:justify-between scroll-mt-24 order-5 md:order-none">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">
            確認状況：{verifiedCount} / {items.length} 項目完了
          </div>
          <div className="text-sm text-slate-500">
            {!isAllVerified 
              ? `残り${items.length - verifiedCount}項目の進行状況を「完了」または「対象外」にすると次工程へ進めます`
              : 'すべての項目の確認・進行が完了しました'
            }
          </div>
          <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mt-1">
            次工程：AI検証・エビデンス
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mt-2 lg:mt-0 w-full lg:w-auto">
          <button 
            onClick={handleSaveDraft}
            className="inline-flex h-12 w-full sm:w-auto sm:min-w-[120px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-soft hover:bg-slate-50"
          >
            一時保存
          </button>
          <button 
            onClick={handleSaveAndNext}
            disabled={!isAllVerified}
            className="inline-flex h-12 w-full sm:w-auto sm:min-w-[240px] items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-soft hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none gap-2 sm:whitespace-nowrap"
          >
            次の工程へ<br className="sm:hidden" />進む
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
