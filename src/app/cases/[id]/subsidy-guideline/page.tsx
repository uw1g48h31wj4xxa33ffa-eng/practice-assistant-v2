"use client";

import React, { useState, use, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import VerificationCard from '@/components/features/ai/VerificationCard';
import CompletionActionArea from '@/components/ui/CompletionActionArea';
import SourceInputPanel from '@/components/features/source/SourceInputPanel';
import { ExtractedInfo, VerificationStatus, SourceDocument } from '@/types';
import { buildMockExtractedItemsFromSources } from '@/lib/ai/mockSourceAnalyzer';

const mockGuidelineItems: ExtractedInfo[] = [
  { id: 'g1', category: '補助金名', originalContent: 'IT導入補助金2024 通常枠', content: 'IT導入補助金2024 通常枠', sourceReference: '公募要項 p.1', status: 'unverified', aiConfidence: 'high' },
  { id: 'g2', category: '公募期間', originalContent: '2024年4月1日 〜 2024年5月31日', content: '2024年4月1日 〜 2024年5月31日', sourceReference: '公募要項 p.2', status: 'unverified', aiConfidence: 'high' },
  { id: 'g3', category: '申請締切', originalContent: '2024年5月31日 17:00 必着', content: '2024年5月31日 17:00 必着', sourceReference: '公募要項 p.2', status: 'unverified', aiConfidence: 'high' },
  { id: 'g4', category: '対象事業', originalContent: '生産性向上に資するITツールの導入', content: '生産性向上に資するITツールの導入', sourceReference: '公募要項 p.4', status: 'unverified', aiConfidence: 'medium' },
  { id: 'g5', category: '対象経費', originalContent: 'ソフトウェア購入費、クラウド利用費（最大2年分）', content: 'ソフトウェア購入費、クラウド利用費（最大2年分）', sourceReference: '公募要項 p.6', status: 'unverified', aiConfidence: 'high' },
  { id: 'g6', category: '補助率', originalContent: '1/2 以内', content: '1/2 以内', sourceReference: '公募要項 p.7', status: 'unverified', aiConfidence: 'high' },
  { id: 'g7', category: '補助上限額', originalContent: '最大 150万円', content: '最大 150万円', sourceReference: '公募要項 p.7', status: 'unverified', aiConfidence: 'medium' },
  { id: 'g8', category: '申請方法', originalContent: 'jGrantsによる電子申請のみ', content: 'jGrantsによる電子申請のみ', sourceReference: '公募要項 p.10', status: 'unverified', aiConfidence: 'high' },
  { id: 'g9', category: '提出先', originalContent: 'IT導入支援事業事務局', content: 'IT導入支援事業事務局', sourceReference: '公募要項 p.10', status: 'unverified', aiConfidence: 'high' },
  { id: 'g10', category: '注意事項', originalContent: 'gBizIDプライムアカウントの事前取得が必須', content: 'gBizIDプライムアカウントの事前取得が必須', sourceReference: '公募要項 p.12', status: 'unverified', aiConfidence: 'high' }
];

const missingInfoMock = [
  { id: 'm1', label: '申請に必要な決算資料の有無' },
  { id: 'm2', label: '見積書の取得状況' },
  { id: 'm3', label: '事業計画書の作成状況' },
  { id: 'm4', label: 'gBizIDの有無' },
  { id: 'm5', label: '提出期限に間に合うか' },
];

export default function SubsidyGuidelinePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: caseId } = use(params);
  const { getCaseById, updateCase } = useCases();
  
  const initialCase = getCaseById(caseId);

  const [items, setItems] = useState<ExtractedInfo[]>(() => {
    if (initialCase?.subsidyGuidelineItems && initialCase.subsidyGuidelineItems.length > 0) {
      return initialCase.subsidyGuidelineItems;
    }
    return mockGuidelineItems;
  });

  const [analyzeStatus, setAnalyzeStatus] = useState<'idle' | 'analyzing' | 'completed' | 'error'>('idle');

  const hasHumanVerifiedItems = items.some(item => 
    item.status === 'verified' || item.status === 'modified' || item.status === 'rejected'
  );

  const sourceDocuments = initialCase?.sourceDocuments ?? [];

  const handleAddDocument = (doc: SourceDocument) => {
    if (!initialCase) return;
    updateCase(caseId, {
      sourceDocuments: [...sourceDocuments, doc]
    });
  };

  const handleRemoveDocument = (docId: string) => {
    if (!initialCase) return;
    updateCase(caseId, {
      sourceDocuments: sourceDocuments.filter(d => d.id !== docId)
    });
  };

  const handleRemoveAllDocuments = () => {
    if (!initialCase) return;
    updateCase(caseId, {
      sourceDocuments: []
    });
  };

  const handleAnalyze = () => {
    if (sourceDocuments.length === 0 || hasHumanVerifiedItems) return;

    setAnalyzeStatus('analyzing');

    setTimeout(() => {
      try {
        const newItems = buildMockExtractedItemsFromSources(sourceDocuments);
        setItems(newItems);
        if (initialCase) {
          updateCase(caseId, { subsidyGuidelineItems: newItems });
        }
        setAnalyzeStatus('completed');
      } catch (error) {
        setAnalyzeStatus('error');
      }
    }, 1500);
  };

  const handleResetItems = () => {
    if (window.confirm('AI抽出項目を削除します。確認済み・修正済みの内容も削除されます。よろしいですか？')) {
      setItems([]);
      if (initialCase) {
        updateCase(caseId, { subsidyGuidelineItems: [] });
      }
      setAnalyzeStatus('idle');
    }
  };

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

  const isCompletedItem = (item: ExtractedInfo) => {
    if (item.status === 'verified') return true;
    if (item.status === 'rejected') return true;
    return false;
  };

  const handleStatusChange = (id: string, newStatus: VerificationStatus, newContent?: string, rejectReason?: string) => {
    const nextItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          content: newContent !== undefined ? newContent : item.content,
          rejectReason: rejectReason !== undefined ? rejectReason : item.rejectReason,
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
      subsidyGuidelineItems: items,
      progressStatus: 'document_prep'
    });
    router.push(`/cases/${caseId}/required-documents`);
  };

  const handleSaveDraft = () => {
    if (!initialCase) return;
    updateCase(caseId, {
      subsidyGuidelineItems: items
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



  const verifiedCount = items.filter(isCompletedItem).length;
  const isAllVerified = items.length > 0 && verifiedCount === items.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-soft-enter flex flex-col md:block">
      {/* ヘッダー・案件サマリー */}
      <div className="flex items-center justify-between mb-4 order-1 md:order-none">
        <div className="flex items-center gap-4">
          <Link href={`/cases/${caseId}`} className="text-slate-500 hover:text-indigo-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">公募要項整理</h1>
        </div>
      </div>

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
      </div>

      <SourceInputPanel 
        sourceDocuments={sourceDocuments}
        onAddDocument={handleAddDocument}
        onRemoveDocument={handleRemoveDocument}
        onRemoveAllDocuments={handleRemoveAllDocuments}
        onAnalyze={handleAnalyze}
        analyzeStatus={analyzeStatus}
        hasHumanVerifiedItems={hasHumanVerifiedItems}
      />

      {/* 公募要項の基本情報 (AI抽出結果) */}
      <div className="space-y-4 order-2 md:order-none">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              AI抽出項目
            </h2>
            <p className="text-sm text-slate-500 mt-1">公募要項から自動抽出された想定項目です。内容を確認し、修正または却下を行ってください。</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-0">
            <div className="text-sm font-bold text-slate-500 order-1 sm:order-2 self-start sm:self-auto">
              確認進捗: {verifiedCount} / {items.length}
            </div>
            {items.length > 0 && (
              <button
                onClick={handleResetItems}
                className="order-2 sm:order-1 w-full sm:w-auto min-h-[44px] sm:min-h-0 flex items-center justify-center gap-1 text-sm sm:text-xs text-slate-500 hover:text-red-600 bg-white sm:bg-slate-100 hover:bg-red-50 px-4 sm:px-3 py-2 sm:py-1.5 rounded-lg sm:rounded transition-colors border border-slate-200 hover:border-red-200 shadow-sm sm:shadow-none font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                抽出結果をリセット
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {sourceDocuments.length === 0 ? (
              <p className="text-slate-500 font-medium">まずPDF・URL・テキストのいずれかを登録してください。</p>
            ) : (
              <p className="text-slate-500 font-medium">資料を登録して「AIで整理する」を押すと、抽出項目がここに表示されます。</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(info => (
            <div key={info.id} id={`card-${info.id}`} className="scroll-mt-24">
              <VerificationCard 
                info={info} 
                onStatusChange={handleStatusChange} 
              />
            </div>
          ))}
          </div>
        )}
      </div>

      {/* 不足情報欄 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-8 order-3 md:order-none">
        <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          要確認・不足情報 (AI検知)
        </h2>
        <ul className="space-y-2">
          {missingInfoMock.map(m => (
            <li key={m.id} className="flex items-start gap-2 text-amber-900 text-sm">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {m.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 完了アクション */}
      <CompletionActionArea
        verifiedCount={verifiedCount}
        totalCount={items.length}
        isAllVerified={isAllVerified}
        progressMessage={!isAllVerified 
          ? `残り${items.length - verifiedCount}項目を確認すると次工程へ進めます`
          : 'すべての項目の確認が完了しました'
        }
        nextStepLabel="次工程：必要資料整理"
        primaryLabel="次の工程へ進む"
        onSaveDraft={handleSaveDraft}
        onProceed={handleSaveAndNext}
      />
    </div>
  );
}
