"use client";

import React, { useState, use, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import { workflowTemplates, getWorkflowTemplateByCaseType } from '@/config/workflowTemplates';
import DeliveryVerificationCard from '@/components/features/ai/DeliveryVerificationCard';
import CompletionActionArea from '@/components/ui/CompletionActionArea';
import { SubsidyDeliveryItem, DeliveryVerificationStatus, DeliveryCompletionStatus } from '@/types';

const mockLaborDeliveryItems: SubsidyDeliveryItem[] = [
  { id: 'ld1', title: '納品ドキュメントの最終確認', purpose: '誤字脱字や法的要件の最終チェック', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '就業規則の第12条について修正漏れがないか確認を推奨します' },
  { id: 'ld2', title: '専門家の最終レビュー', purpose: '作成物に対する専門家の担保', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '社労士による最終承認が必要です' },
  { id: 'ld3', title: '顧問先共有前チェック', purpose: 'クライアントへ送付する文面や注意事項の確認', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '今回の改訂による給与計算への影響をクライアントへ説明する文面が必要です', cautionNote: '納品時に必ず説明会を設定すること' },
  { id: 'ld4', title: '届出用書類の準備', purpose: '労基署などへの届出用フォーマット作成', importance: 'medium', verificationStatus: 'unverified', completionStatus: 'not_required', aiMemo: '今回は規程ドラフトの納品までのため、届出書類作成は対象外です' }
];

const mockLaborConsultingItems: SubsidyDeliveryItem[] = [
  { id: 'lc1', title: '相談内容・事実関係の最終確認', purpose: 'ヒアリング内容と整理した論点に認識差がないか', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '' },
  { id: 'lc2', title: '労務リスクの確認', purpose: '未確認または要修正のリスク項目が残っていないか', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '' },
  { id: 'lc3', title: '対応方針の確認', purpose: '採用した対応方針と相談内容が整合しているか', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '' },
  { id: 'lc4', title: '関連資料・証拠の確認', purpose: '就業規則、雇用契約書、勤怠資料、相談記録等が整理されているか', importance: 'medium', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '' },
  { id: 'lc5', title: 'AI検証・エビデンスの確認', purpose: '要修正または未確認の検証項目が残っていないか', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '' },
  { id: 'lc6', title: '相談記録・対応履歴の確認', purpose: '後から経緯を確認できる状態になっているか', importance: 'medium', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '' },
  { id: 'lc7', title: '専門家による最終判断事項の確認', purpose: '法的判断や個別判断が必要な事項を明確にしているか', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '' },
  { id: 'lc8', title: '納品・共有内容の確認', purpose: '相談結果、対応方針、注意事項、次の対応が整理されているか', importance: 'high', verificationStatus: 'unverified', completionStatus: 'incomplete', aiMemo: '' },
];

export default function LaborDeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: caseId } = use(params);
  const { getCaseById, updateCase } = useCases();
  
  const initialCase = getCaseById(caseId);

  const [showCompletedContent, setShowCompletedContent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [items, setItems] = useState<SubsidyDeliveryItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const resolvedTemplate = initialCase?.templateId 
    ? workflowTemplates.find(t => t.id === initialCase.templateId)
    : initialCase ? getWorkflowTemplateByCaseType(initialCase.caseType) : undefined;
  const isLaborConsulting = resolvedTemplate?.id === "labor_consulting_v1";

  // caseIdが変わったら再初期化
  useEffect(() => {
    setIsInitialized(false);
  }, [caseId]);

  useEffect(() => {
    if (initialCase && !isInitialized) {
      if (isLaborConsulting) {
        setItems(mockLaborConsultingItems);
      } else {
        if (initialCase.subsidyDeliveryItems && initialCase.subsidyDeliveryItems.length > 0) {
          setItems(initialCase.subsidyDeliveryItems);
        } else {
          setItems(mockLaborDeliveryItems);
        }
      }
      setIsInitialized(true);
    }
  }, [initialCase, isLaborConsulting, isInitialized]);

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

  const handleLaborItemStatusChange = (
    itemId: string,
    newCompletionStatus: DeliveryCompletionStatus,
    newVerificationStatus: DeliveryVerificationStatus
  ) => {
    const nextItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          completionStatus: newCompletionStatus,
          verificationStatus: newVerificationStatus
        };
      }
      return item;
    });

    setItems(nextItems);

    setTimeout(() => {
      const currentIndex = items.findIndex(i => i.id === itemId);
      if (currentIndex === -1) return;

      const nextIncomplete = nextItems.slice(currentIndex + 1).find(i => 
        i.completionStatus === 'incomplete' || i.completionStatus === 'issue_found'
      );
      
      let targetScrollId: string | null = null;
      if (nextIncomplete) {
        targetScrollId = `labor-card-${nextIncomplete.id}`;
      } else {
        const prevIncomplete = nextItems.slice(0, currentIndex).find(i => 
          i.completionStatus === 'incomplete' || i.completionStatus === 'issue_found'
        );
        if (prevIncomplete) {
          targetScrollId = `labor-card-${prevIncomplete.id}`;
        }
      }

      if (targetScrollId) {
        document.getElementById(targetScrollId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const allCompleted = nextItems.every(i => i.completionStatus === 'completed' || i.completionStatus === 'not_required');
        if (allCompleted) {
          document.getElementById('labor-next-action-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50);
  };

  const handleSaveAndNext = () => {
    if (!initialCase || isProcessing) return;
    
    if (isLaborConsulting) {
      const hasUnfinishedIssue = initialCase.issueItems?.some(i => i.status === 'unchecked' || i.status === 'needs_revision');
      const hasUnfinishedRisk = initialCase.riskItems?.some(i => i.status === 'unchecked' || i.status === 'needs_revision');
      const hasUnfinishedAction = initialCase.actionPlanItems?.some(i => i.status === 'unchecked' || i.status === 'needs_revision');
      const hasUnfinishedDoc = initialCase.requiredDocuments?.some(i => i.status === 'not_started' || i.status === 'requested');
      const hasUnfinishedEvidence = initialCase.evidenceItems?.some(i => i.status === 'unchecked' || i.status === 'needs_revision');
      
      const hasUnfinishedDelivery = items.some(i => i.completionStatus === 'incomplete' || i.completionStatus === 'issue_found');
      
      const hasUnfinished = hasUnfinishedIssue || hasUnfinishedRisk || hasUnfinishedAction || hasUnfinishedDoc || hasUnfinishedEvidence || hasUnfinishedDelivery;
      
      if (hasUnfinished) {
        if (!window.confirm('未確認または要修正の項目が残っています。このまま案件を完了にしますか？')) {
          return;
        }
      }
      setIsProcessing(true);
      updateCase(caseId, { progressStatus: 'completed' });
      router.push(`/cases/${caseId}`);
    } else {
      setIsProcessing(true);
      updateCase(caseId, {
        subsidyDeliveryItems: items,
        progressStatus: 'completed'
      });
      router.push(`/cases/${caseId}`);
    }
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
        <div className="flex items-center gap-4 mb-6 pt-4 md:pt-0">
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

  if (isLaborConsulting) {
    const totalItems = items.length;
    const completedCount = items.filter(i => i.completionStatus === 'completed' || i.completionStatus === 'not_required').length;
    const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
    const remainingCount = totalItems - completedCount;
    
    const hasUnfinishedIssueCount = initialCase?.issueItems?.filter(i => i.status === 'unchecked' || i.status === 'needs_revision').length || 0;
    const hasUnfinishedRiskCount = initialCase?.riskItems?.filter(i => i.status === 'unchecked' || i.status === 'needs_revision').length || 0;
    const hasUnfinishedActionCount = initialCase?.actionPlanItems?.filter(i => i.status === 'unchecked' || i.status === 'needs_revision').length || 0;
    const hasUnfinishedDocCount = initialCase?.requiredDocuments?.filter(i => i.status === 'not_started' || i.status === 'requested').length || 0;
    const hasUnfinishedEvidenceCount = initialCase?.evidenceItems?.filter(i => i.status === 'unchecked' || i.status === 'needs_revision').length || 0;
    const priorUnfinishedCount = hasUnfinishedIssueCount + hasUnfinishedRiskCount + hasUnfinishedActionCount + hasUnfinishedDocCount + hasUnfinishedEvidenceCount;

    const laborAttentionItems = items.filter(i => i.completionStatus === 'issue_found' || i.completionStatus === 'incomplete');

    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-soft-enter pb-12">
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <Link href={`/cases/${caseId}`} className="text-slate-400 hover:text-indigo-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">納品・完了 <span className="text-sm font-normal text-slate-500 ml-2">労務相談</span></h1>
            <p className="text-sm text-slate-500 mt-0.5">{initialCase.title} | {initialCase.clientName} | 担当: {initialCase.assignee}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  納品・完了進捗
                </h2>
              </div>
              <div className="p-5">
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-indigo-500 transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray={`${progressPercent}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-800">{progressPercent}<span className="text-lg text-slate-500 ml-1">%</span></span>
                      <span className="text-[10px] font-bold text-slate-400">完了</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-slate-600">完了 {completedCount}</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200"></div><span className="text-slate-600">残り {remainingCount}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {laborAttentionItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  要確認項目
                </h3>
                <ul className="space-y-2">
                  {laborAttentionItems.map(i => (
                    <li key={i.id} className={`text-sm rounded-lg p-2 border flex items-center justify-between ${
                      i.completionStatus === 'issue_found' ? 'text-red-700 bg-white border-red-100' : 'text-amber-700 bg-white border-amber-100'
                    }`}>
                      <span className="truncate mr-2 font-bold">{i.title}</span>
                      <button 
                        onClick={() => document.getElementById(`labor-card-${i.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                        className={`text-xs shrink-0 border px-2 py-1 rounded ${
                          i.completionStatus === 'issue_found' ? 'text-red-500 hover:text-red-800 border-red-200 bg-red-50' : 'text-amber-600 hover:text-amber-800 border-amber-200 bg-amber-50'
                        }`}
                      >
                        確認
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col gap-3">
              {items.map(item => {
                const isCompleted = item.completionStatus === 'completed';
                const isNotRequired = item.completionStatus === 'not_required';
                const isIssue = item.completionStatus === 'issue_found';
                const isIncomplete = item.completionStatus === 'incomplete';
                
                return (
                  <div key={item.id} id={`labor-card-${item.id}`} className={`bg-white p-5 sm:p-6 rounded-xl border shadow-sm transition-colors ${
                    isCompleted ? 'border-emerald-300 bg-emerald-50/30' :
                    isNotRequired ? 'border-slate-200 bg-slate-50 opacity-75' :
                    isIssue ? 'border-red-300 bg-red-50/30' : 
                    'border-slate-200 hover:border-indigo-100'
                  }`}>
                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 mb-3">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className={`px-2 py-0.5 border rounded text-[10px] font-bold shrink-0 ${
                              isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              isIssue ? 'bg-red-50 text-red-700 border-red-200' :
                              isNotRequired ? 'bg-slate-100 text-slate-500 border-slate-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {isCompleted ? '確認済' :
                               isIssue ? '要修正' :
                               isNotRequired ? '対象外' : '未確認'}
                            </span>
                          </div>
                          <h4 className={`font-bold block w-full min-w-0 break-words break-all leading-snug overflow-hidden text-[15px] sm:text-base ${
                            isCompleted || isNotRequired ? 'text-slate-500' : 'text-slate-800'
                          }`}>
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[13px] sm:text-xs text-slate-500 mb-2 leading-[1.8] sm:leading-relaxed">
                          {item.purpose}
                        </p>
                      </div>
                      
                      <div className="shrink-0 w-full xl:w-auto">
                        <div className="hidden sm:flex flex-wrap items-center gap-2">
                          {isIncomplete || isIssue || isNotRequired ? (
                            <button onClick={() => handleLaborItemStatusChange(item.id, 'completed', 'verified')} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">確認済にする</button>
                          ) : null}
                          {isIncomplete || isCompleted || isNotRequired ? (
                            <button onClick={() => handleLaborItemStatusChange(item.id, 'issue_found', 'unverified')} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">要修正にする</button>
                          ) : null}
                          {isIncomplete || isIssue ? (
                            <button onClick={() => handleLaborItemStatusChange(item.id, 'not_required', 'rejected')} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">対象外にする</button>
                          ) : null}
                          {isCompleted || isIssue || isNotRequired ? (
                            <button onClick={() => handleLaborItemStatusChange(item.id, 'incomplete', 'unverified')} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">未確認に戻す</button>
                          ) : null}
                        </div>
                        <div className="flex sm:hidden items-center gap-2 w-full mt-3">
                          {isIncomplete || isIssue || isNotRequired ? (
                            <button onClick={() => handleLaborItemStatusChange(item.id, 'completed', 'verified')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 whitespace-nowrap">確認済</button>
                          ) : null}
                          {isIncomplete || isCompleted || isNotRequired ? (
                            <button onClick={() => handleLaborItemStatusChange(item.id, 'issue_found', 'unverified')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 whitespace-nowrap">要修正</button>
                          ) : null}
                          {isIncomplete || isIssue ? (
                            <button onClick={() => handleLaborItemStatusChange(item.id, 'not_required', 'rejected')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 whitespace-nowrap">対象外</button>
                          ) : null}
                          {isCompleted || isIssue || isNotRequired ? (
                            <button onClick={() => handleLaborItemStatusChange(item.id, 'incomplete', 'unverified')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 whitespace-nowrap">未確認</button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div id="labor-next-action-area" className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">確認が完了したら案件を完了してください</h3>
            {priorUnfinishedCount > 0 && (
              <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                前工程に未確認・要修正の項目が {priorUnfinishedCount} 件残っています
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              納品確認：未完了 {remainingCount} 件
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link
              href={`/cases/${caseId}`}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg shadow-sm transition-colors border border-slate-200 flex items-center justify-center min-h-[44px]"
            >
              案件詳細へ戻る
            </Link>
            <button
              onClick={handleSaveAndNext}
              disabled={isProcessing}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0 min-h-[44px] disabled:opacity-50"
            >
              {isProcessing ? '処理中...' : '案件を完了する'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-soft-enter flex flex-col md:block">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4 pt-4 md:pt-0 order-1 md:order-none">
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
      <CompletionActionArea
        verifiedCount={verifiedCount}
        totalCount={items.length}
        isAllVerified={isAllVerified}
        progressMessage={!isAllVerified 
          ? `残り${items.length - verifiedCount}項目の対応状況を確認すると全工程を完了できます`
          : 'すべての納品前準備の確認が完了しました'
        }
        nextStepLabel="次工程：全工程完了"
        nextStepVariant="emerald"
        primaryLabel="完了する"
        primaryIcon="check"
        onSaveDraft={isLaborConsulting ? () => alert('この画面の確認状態は一時的です。') : handleSaveDraft}
        onProceed={handleSaveAndNext}
      />
    </div>
  );
}
