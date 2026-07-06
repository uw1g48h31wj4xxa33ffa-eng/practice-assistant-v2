"use client";

import React, { useState, use, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import DeliveryVerificationCard from '@/components/features/ai/DeliveryVerificationCard';
import { SubsidyDeliveryItem, DeliveryVerificationStatus, DeliveryCompletionStatus } from '@/types';

const mockLaborDeliveryItems: SubsidyDeliveryItem[] = [
  { id: 'ld1', title: '納品ドキュメントの最終確認', purpose: '誤字脱字や法的要件の最終チェック', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '就業規則の第12条について修正漏れがないか確認を推奨します' },
  { id: 'ld2', title: '専門家の最終レビュー', purpose: '作成物に対する専門家の担保', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '社労士による最終承認が必要です' },
  { id: 'ld3', title: '顧問先共有前チェック', purpose: 'クライアントへ送付する文面や注意事項の確認', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '今回の改訂による給与計算への影響をクライアントへ説明する文面が必要です', cautionNote: '納品時に必ず説明会を設定すること' },
  { id: 'ld4', title: '届出用書類の準備', purpose: '労基署などへの届出用フォーマット作成', importance: 'medium', verificationStatus: 'unverified', completionStatus: 'not_required', aiMemo: '今回は規程ドラフトの納品までのため、届出書類作成は対象外です' }
];

export default function LaborDeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: caseId } = use(params);
  const { getCaseById, updateCase } = useCases();
  
  const initialCase = getCaseById(caseId);

  const [showCompletedContent, setShowCompletedContent] = useState(false);

  // 初期表示ではローカルstateにモックデータを持たせる
  const [items, setItems] = useState<SubsidyDeliveryItem[]>(() => {
    if (initialCase?.subsidyDeliveryItems && initialCase.subsidyDeliveryItems.length > 0) {
      return initialCase.subsidyDeliveryItems;
    }
    return mockLaborDeliveryItems;
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

  const isCompletedItem = (item: SubsidyDeliveryItem) => {
    if (item.verificationStatus === 'verified' && item.completionStatus === 'completed') return true;
    if (item.verificationStatus === 'rejected') return true;
    return false;
  };

  const handleStatusChange = (
    id: string, 
    newVerificationStatus: DeliveryVerificationStatus, 
    newCompletionStatus?: DeliveryCompletionStatus, 
    newNotes?: string, 
    newCautionNote?: string
  ) => {
    const nextItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          verificationStatus: newVerificationStatus,
          completionStatus: newCompletionStatus !== undefined ? newCompletionStatus : item.completionStatus,
          notes: newNotes !== undefined ? newNotes : item.notes,
          cautionNote: newCautionNote !== undefined ? newCautionNote : item.cautionNote,
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
    
    // updateCaseでローカルstateのデータを保存しつつ、次工程(全工程完了)へ進む
    updateCase(caseId, {
      subsidyDeliveryItems: items,
      progressStatus: 'completed'
    });
    // 自動遷移を停止するため削除
    // router.push(`/cases/${caseId}`);
  };

  const handleSaveDraft = () => {
    if (!initialCase) return;
    updateCase(caseId, {
      subsidyDeliveryItems: items
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

  if (initialCase.progressStatus === 'completed' && !showCompletedContent) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-soft-enter">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/cases/${caseId}`} className="text-slate-500 hover:text-indigo-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">納品</h1>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-emerald-800 mb-2">この案件は<br className="sm:hidden" />全工程が完了しています</h2>
          <p className="text-emerald-600 mb-8 max-w-lg mx-auto">
            すべての業務工程が完了し、最終確認が完了済みです。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={`/cases/${caseId}`}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:-translate-y-0.5"
            >
              案件詳細へ戻る
            </Link>
            <button
              onClick={() => setShowCompletedContent(true)}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-emerald-300 bg-white px-8 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 hover:-translate-y-0.5"
            >
              確認内容を閲覧する
            </button>
          </div>
        </div>
      </div>
    );
  }


  const verifiedCount = items.filter(isCompletedItem).length;
  const isAllVerified = items.length > 0 && verifiedCount === items.length;

  // 要対応・未完了のアイテムをリストアップ
  const attentionItems = items.filter(
    i => i.completionStatus === 'issue_found' || i.completionStatus === 'incomplete'
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
          <h1 className="text-2xl font-bold text-slate-800">納品前最終チェック</h1>
        </div>
      </div>

      {/* 案件情報サマリー */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6 order-4 md:order-none">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">案件情報サマリー</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
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
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {initialCase.validationRecord && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2">AI検証・エビデンス</h3>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-indigo-700 mr-2">ステータス: {initialCase.reviewStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 提出・納品前チェックリスト (AI抽出結果) */}
      <div className="space-y-4 order-2 md:order-none">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              納品前チェックリスト
            </h2>
            <p className="text-sm text-slate-500 mt-1">AIが前工程の情報を元に最終確認項目を抽出しました。各項目の完了状況を確認してください。</p>
          </div>
          <div className="text-sm font-bold text-slate-500">
            確認進捗: {verifiedCount} / {items.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} id={`card-${item.id}`} className="scroll-mt-24">
              <DeliveryVerificationCard 
                item={item} 
                onStatusChange={handleStatusChange} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* 要対応・注意事項欄 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-8 order-3 md:order-none">
        <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          要対応・注意事項
        </h2>
        {attentionItems.length > 0 ? (
          <ul className="space-y-2">
            {attentionItems.map(item => (
              <li key={item.id} className="flex items-start gap-2 text-amber-900 text-sm">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-bold">{item.title}</span>
                  <span className="text-amber-700 text-xs mt-0.5">
                    {item.completionStatus === 'issue_found' ? '要対応事項です。' : '未完了の項目です。'}
                    {item.cautionNote ? ` ${item.cautionNote}` : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-amber-700">現在、要対応・注意事項はありません。</p>
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
              ? `残り${items.length - verifiedCount}項目の対応状況を確認すると全工程を完了できます`
              : 'すべての納品前準備の確認が完了しました'
            }
          </div>
          <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 mt-1">
            次工程：全工程完了
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
            納品工程を<br className="sm:hidden" />完了する
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
