"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import { ActionPlanItem } from '@/types';
import { generateMockActionPlanItems } from '@/lib/ai/mockActionPlanGenerator';

export default function ActionPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: caseId } = use(params);
  const { cases, getCaseById, updateCase } = useCases();
  
  const [isClient, setIsClient] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentCase = cases.find(c => c.id === caseId);

  if (!isClient) return null;

  if (!currentCase) {
    return <div className="p-8 text-center text-slate-500">案件が見つかりません。</div>;
  }

  const actionPlanItems = currentCase.actionPlanItems || [];
  
  const totalItems = actionPlanItems.length;
  const selectedCount = actionPlanItems.filter(i => i.status === 'selected').length;
  const notApplicableCount = actionPlanItems.filter(i => i.status === 'not_applicable').length;
  const needsRevisionCount = actionPlanItems.filter(i => i.status === 'needs_revision').length;
  const uncheckedCount = actionPlanItems.filter(i => i.status === 'unchecked').length;

  const completedCount = selectedCount + notApplicableCount;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const hasIncomplete = (needsRevisionCount > 0 || uncheckedCount > 0);

  const highPriorityOpenItems = actionPlanItems.filter(
    item =>
      item.priority === 'high' &&
      (item.status === 'unchecked' || item.status === 'needs_revision')
  );

  const handleNextStep = () => {
    if (hasIncomplete) {
      const confirmMsg = "未確認または要修正の対応方針が残っています。\nこのまま次の工程（AI検証・エビデンス）へ進みますか？";
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }
    updateCase(caseId, { progressStatus: 'ai_evidence' });
    router.push(`/cases/${caseId}/ai-evidence`);
  };

  const handleGenerate = async () => {
    setIsAnalyzing(true);
    try {
      const newItems = await generateMockActionPlanItems();
      updateCase(caseId, { actionPlanItems: newItems });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStatusChange = (itemId: string, newStatus: ActionPlanItem['status']) => {
    const newItems = actionPlanItems.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    );
    updateCase(caseId, { actionPlanItems: newItems });

    // Auto-scroll to next item
    const isCompleted = (status: string | undefined) => status === 'selected' || status === 'not_applicable';
    if (isCompleted(newStatus) || newStatus === 'needs_revision') {
      const currentIndex = actionPlanItems.findIndex(i => i.id === itemId);
      let nextTarget = newItems.slice(currentIndex + 1).find(item => !isCompleted(item.status));
      if (!nextTarget) {
        nextTarget = newItems.slice(0, currentIndex).find(item => !isCompleted(item.status));
      }

      setTimeout(() => {
        if (nextTarget) {
          const element = document.getElementById(`action-card-${nextTarget.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          // All complete
          const element = document.getElementById('action-completion-area');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  };

  const renderContextualButtons = (item: ActionPlanItem) => {
    const status = item.status || 'unchecked';
    if (status === 'unchecked') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'selected')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
            <span className="hidden sm:inline">採用候補にする</span>
            <span className="sm:hidden">採用候補</span>
          </button>
          <button onClick={() => handleStatusChange(item.id, 'needs_revision')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap">
            <span className="hidden sm:inline">要修正にする</span>
            <span className="sm:hidden">要修正</span>
          </button>
          <button onClick={() => handleStatusChange(item.id, 'not_applicable')} className="px-3 shrink-0 min-h-[44px] rounded-lg text-[10px] font-bold transition-colors border bg-slate-100 text-slate-500 border-slate-200 whitespace-nowrap">
            <span className="hidden sm:inline">対象外にする</span>
            <span className="sm:hidden">対象外</span>
          </button>
        </div>
      );
    } else if (status === 'selected') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'needs_revision')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap">
            <span className="hidden sm:inline">要修正にする</span>
            <span className="sm:hidden">要修正</span>
          </button>
          <button onClick={() => handleStatusChange(item.id, 'unchecked')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">
            <span className="hidden sm:inline">未確認に戻す</span>
            <span className="sm:hidden">未確認</span>
          </button>
        </div>
      );
    } else if (status === 'needs_revision') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'selected')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
            <span className="hidden sm:inline">採用候補にする</span>
            <span className="sm:hidden">採用候補</span>
          </button>
          <button onClick={() => handleStatusChange(item.id, 'unchecked')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">
            <span className="hidden sm:inline">未確認に戻す</span>
            <span className="sm:hidden">未確認</span>
          </button>
        </div>
      );
    } else {
      // not_applicable
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'unchecked')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">
            <span className="hidden sm:inline">未確認に戻す</span>
            <span className="sm:hidden">未確認</span>
          </button>
        </div>
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/cases/${caseId}`} className="text-slate-500 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">対応方針</h1>
          <p className="text-sm text-slate-500 mt-1">{currentCase.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                対応方針
              </h2>
            </div>
            
            <div className="p-5">
              {/* ドーナツ進捗 */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-500 transition-all duration-1000 ease-out"
                      strokeWidth="3"
                      strokeDasharray={`${progressPercent}, 100`}
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-slate-800">{progressPercent}<span className="text-sm">%</span></span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    完了 (採用候補/対象外)
                  </span>
                  <span className="font-bold text-slate-800">{completedCount}件</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    要修正
                  </span>
                  <span className="font-bold text-slate-800">{needsRevisionCount}件</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                    未確認
                  </span>
                  <span className="font-bold text-slate-800">{uncheckedCount}件</span>
                </div>
              </div>
            </div>
          </div>

          {totalItems > 0 && highPriorityOpenItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                優先対応項目 (高)
              </h3>
              <ul className="space-y-2">
                {highPriorityOpenItems.map(i => (
                  <li key={`high-${i.id}`} className="text-sm text-red-700 bg-white rounded-lg p-2 border border-red-100 flex items-center justify-between">
                    <span className="truncate mr-2 font-bold">
                      {i.title}
                    </span>
                    <button 
                      onClick={() => document.getElementById(`action-card-${i.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                      className="text-xs text-red-500 hover:text-red-800 shrink-0 border border-red-200 px-2 py-1 rounded bg-red-50 transition-colors"
                    >
                      確認
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {totalItems === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center h-full flex flex-col justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">対応方針の候補を生成します</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                これまでの論点整理やリスク整理の内容に基づき、AIが推奨する対応方針案をリストアップします。
              </p>
              <button
                onClick={handleGenerate}
                disabled={isAnalyzing}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-sm mx-auto flex items-center justify-center min-w-[200px]"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成中...
                  </>
                ) : 'AIで対応方針候補を生成する'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-600">対応方針候補 {totalItems}件</p>
                <button
                  onClick={handleGenerate}
                  disabled={isAnalyzing}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isAnalyzing ? '再生成中...' : '再生成'}
                </button>
              </div>

              {actionPlanItems.map((item, index) => (
                <div 
                  key={item.id} 
                  id={`action-card-${item.id}`}
                  className={`bg-white rounded-xl border transition-all overflow-hidden ${
                    item.status === 'selected' ? 'border-green-300 ring-1 ring-green-300 shadow-sm' :
                    item.status === 'needs_revision' ? 'border-amber-300 ring-1 ring-amber-300 shadow-sm' :
                    item.status === 'not_applicable' ? 'border-slate-200 bg-slate-50 opacity-75' :
                    'border-slate-200 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                          {item.priority === 'high' && <span className="text-[10px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded">優先度: 高</span>}
                          {item.priority === 'medium' && <span className="text-[10px] font-bold text-slate-600 bg-amber-200 px-1.5 py-0.5 rounded">優先度: 中</span>}
                        </div>
                        <h4 className="font-bold text-slate-800 text-base">{item.title}</h4>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-5 pb-4 space-y-3">
                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="font-bold text-slate-800 text-xs mb-1">サマリー</div>
                      {item.summary}
                    </div>
                    
                    <div className="text-sm text-slate-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                      <div className="font-bold text-indigo-800 text-xs mb-1">推奨アクション</div>
                      {item.recommendedAction}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div className="text-xs text-slate-600 bg-green-50/50 p-2.5 rounded border border-green-100">
                        <span className="font-bold text-green-700 block mb-0.5">メリット</span>
                        {item.merit}
                      </div>
                      <div className="text-xs text-slate-600 bg-rose-50/50 p-2.5 rounded border border-rose-100">
                        <span className="font-bold text-rose-700 block mb-0.5">デメリット・注意点</span>
                        {item.demerit}
                      </div>
                    </div>

                    {item.sourceReference && (
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        出典: {item.sourceReference}
                      </p>
                    )}
                  </div>
                  
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-white">
                    {renderContextualButtons(item)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div id="action-completion-area" className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-slate-200">
        <Link href={`/cases/${caseId}`} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all w-full sm:w-auto text-center">
          案件詳細へ戻る
        </Link>
        <button
          onClick={handleNextStep}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
        >
          <span>次の工程へ進む</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
