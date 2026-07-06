"use client";

import React, { useState, use, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import DocumentVerificationCard from '@/components/features/ai/DocumentVerificationCard';
import { SubsidyDocumentItem, VerificationStatus, DocumentPreparationStatus } from '@/types';

const mockDocumentItems: SubsidyDocumentItem[] = [
  { id: 'd1', documentName: '会社基本情報（履歴事項全部証明書）', purpose: '法人格および基本情報の確認', isRequired: true, preparationStatus: 'prepared', status: 'unverified', aiMemo: '取得後3ヶ月以内のものが必要' },
  { id: 'd2', documentName: '直近2期分の決算書', purpose: '財務状況の確認', isRequired: true, preparationStatus: 'pending', status: 'unverified', aiMemo: '勘定科目内訳明細書も含む' },
  { id: 'd3', documentName: '導入予定ITツールの見積書', purpose: '補助対象経費の根拠', isRequired: true, preparationStatus: 'missing', status: 'unverified', aiMemo: 'ベンダー発行の正式な見積書が必要' },
  { id: 'd4', documentName: 'gBizIDプライム アカウント', purpose: '電子申請用', isRequired: true, preparationStatus: 'prepared', status: 'unverified', aiMemo: 'すでに取得済みであることを確認' },
  { id: 'd5', documentName: '事業計画書（ドラフト）', purpose: '事業内容・目標の提示', isRequired: true, preparationStatus: 'pending', status: 'unverified', aiMemo: '現在社内で作成中、月末までに一次案完成予定' },
  { id: 'd6', documentName: '労働保険申告書・納付書', purpose: '労働保険加入状況の確認', isRequired: false, preparationStatus: 'not_required', status: 'unverified', aiMemo: '今回の枠では必須ではないため対象外としてよいか確認' },
];

export default function SubsidyDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: caseId } = use(params);
  const { getCaseById, updateCase } = useCases();
  
  const initialCase = getCaseById(caseId);

  // 初期表示ではローカルstateにモックデータを持たせる
  const [items, setItems] = useState<SubsidyDocumentItem[]>(() => {
    if (initialCase?.subsidyDocumentItems && initialCase.subsidyDocumentItems.length > 0) {
      return initialCase.subsidyDocumentItems;
    }
    return mockDocumentItems;
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

  const isCompletedItem = (item: SubsidyDocumentItem) => {
    if (item.status === 'verified' && item.preparationStatus === 'prepared') return true;
    if (item.status === 'rejected') return true;
    return false;
  };

  const handleStatusChange = (
    id: string, 
    newStatus: VerificationStatus, 
    newPreparationStatus?: DocumentPreparationStatus, 
    newNotes?: string, 
    newRejectReason?: string
  ) => {
    const nextItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          preparationStatus: newPreparationStatus !== undefined ? newPreparationStatus : item.preparationStatus,
          notes: newNotes !== undefined ? newNotes : item.notes,
          rejectReason: newRejectReason !== undefined ? newRejectReason : item.rejectReason,
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
      (currentItem.status !== 'verified' && currentItem.status !== 'rejected') && 
      (newStatus === 'verified' || newStatus === 'rejected');

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
      subsidyDocumentItems: items,
      progressStatus: 'schedule_management'
    });
    router.push(`/cases/${caseId}/subsidy-schedule`);
  };

  const handleSaveDraft = () => {
    if (!initialCase) return;
    updateCase(caseId, {
      subsidyDocumentItems: items
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

  // 完了判定: verified または rejected が対象（modifiedやunverifiedは不可）


  const verifiedCount = items.filter(isCompletedItem).length;
  const isAllVerified = items.length > 0 && verifiedCount === items.length;

  // 不足・準備中・未確認のアイテムをリストアップ
  const attentionItems = items.filter(
    i => i.preparationStatus === 'missing' || i.preparationStatus === 'pending'
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
          <h1 className="text-2xl font-bold text-slate-800">必要資料整理</h1>
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
        {initialCase.subsidyGuidelineItems && initialCase.subsidyGuidelineItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 mb-3">前工程（公募要項）の確認事項</h3>
            <div className="flex flex-wrap gap-2">
              {initialCase.subsidyGuidelineItems.filter(i => i.status === 'verified').slice(0, 4).map(item => (
                <div key={item.id} className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-600">
                  <span className="font-bold">{item.category}:</span>
                  <span>{item.content}</span>
                </div>
              ))}
              {initialCase.subsidyGuidelineItems.filter(i => i.status === 'verified').length > 4 && (
                <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-500">
                  他 {initialCase.subsidyGuidelineItems.filter(i => i.status === 'verified').length - 4} 件...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 必要資料リスト (AI抽出結果) */}
      <div className="space-y-4 order-2 md:order-none">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              必要資料リスト（AI抽出）
            </h2>
            <p className="text-sm text-slate-500 mt-1">AIが前工程の情報を元に必要な資料を整理しました。各資料の準備状況を確認してください。</p>
          </div>
          <div className="text-sm font-bold text-slate-500">
            確認進捗: {verifiedCount} / {items.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} id={`card-${item.id}`} className="scroll-mt-24">
              <DocumentVerificationCard 
                item={item} 
                onStatusChange={handleStatusChange} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* 不足情報欄 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-8 order-3 md:order-none">
        <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          要確認・不足資料
        </h2>
        {attentionItems.length > 0 ? (
          <ul className="space-y-2">
            {attentionItems.map(item => (
              <li key={item.id} className="flex items-start gap-2 text-amber-900 text-sm">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-bold">{item.documentName}</span>
                  <span className="text-amber-700 text-xs mt-0.5">{item.preparationStatus === 'missing' ? '不足しています' : '準備中です'}。取得状況を確認してください。</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-amber-700">現在、不足または準備中の資料はありません。</p>
        )}
      </div>

      {/* 完了アクション */}
      <div id="completion-area" className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 mt-8 lg:flex-row lg:items-center lg:justify-between scroll-mt-24 order-5 md:order-none">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">
            確認状況：{verifiedCount} / {items.length} 資料完了
          </div>
          <div className="text-sm text-slate-500">
            {!isAllVerified 
              ? `残り${items.length - verifiedCount}資料の準備状況を確認すると次工程へ進めます`
              : 'すべての資料の確認が完了しました'
            }
          </div>
          <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mt-1">
            次工程：スケジュール管理
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
