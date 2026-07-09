"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import { IssueItem } from '@/types';
import { generateMockIssueItems } from '@/lib/ai/mockIssueAnalyzer';

export default function IssueAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
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

  const issueItems = currentCase.issueItems || [];
  
  const totalItems = issueItems.length;
  const verifiedCount = issueItems.filter(i => i.status === 'verified').length;
  const notApplicableCount = issueItems.filter(i => i.status === 'not_applicable').length;
  const needsRevisionCount = issueItems.filter(i => i.status === 'needs_revision').length;
  const uncheckedCount = issueItems.filter(i => i.status === 'unchecked').length;

  const completedCount = verifiedCount + notApplicableCount;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const remainingCount = totalItems - completedCount;
  const hasIncomplete = (needsRevisionCount > 0 || uncheckedCount > 0);

  const handleNextStep = () => {
    if (hasIncomplete) {
      const confirmMsg = "未確認または要修正の論点が残っています。\nこのまま次の工程（必要資料整理）へ進みますか？";
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }
    updateCase(caseId, { progressStatus: 'document_prep' });
    router.push(`/cases/${caseId}/required-documents`);
  };

  const handleGenerate = async () => {
    setIsAnalyzing(true);
    try {
      const newItems = await generateMockIssueItems();
      updateCase(caseId, { issueItems: newItems });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStatusChange = (itemId: string, newStatus: IssueItem['status']) => {
    const newItems = issueItems.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    );
    updateCase(caseId, { issueItems: newItems });
  };

  const renderContextualButtons = (item: IssueItem) => {
    const status = item.status || 'unchecked';
    if (status === 'unchecked') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'verified')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
            <span className="hidden sm:inline">確認済にする</span>
            <span className="sm:hidden">確認済</span>
          </button>
          <button onClick={() => handleStatusChange(item.id, 'needs_revision')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-red-50 text-red-700 border-red-200 whitespace-nowrap">
            <span className="hidden sm:inline">要修正にする</span>
            <span className="sm:hidden">要修正</span>
          </button>
          <button onClick={() => handleStatusChange(item.id, 'not_applicable')} className="px-3 shrink-0 min-h-[44px] rounded-lg text-[10px] font-bold transition-colors border bg-slate-100 text-slate-500 border-slate-200 whitespace-nowrap">
            <span className="hidden sm:inline">対象外にする</span>
            <span className="sm:hidden">対象外</span>
          </button>
        </div>
      );
    } else if (status === 'verified') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'needs_revision')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-red-50 text-red-700 border-red-200 whitespace-nowrap">
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
          <button onClick={() => handleStatusChange(item.id, 'verified')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
            <span className="hidden sm:inline">確認済にする</span>
            <span className="sm:hidden">確認済</span>
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
          <h1 className="text-2xl font-bold text-slate-800">論点整理</h1>
          <p className="text-sm text-slate-500 mt-1">{currentCase.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-6">
            <div className="bg-slate-50 border-b border-slate-100 p-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                論点整理
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
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">{progressPercent}<span className="text-lg text-slate-500 ml-1">%</span></span>
                    <span className="text-[10px] font-bold text-slate-400">完了</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-slate-600">完了 {completedCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    <span className="text-slate-600">残り {remainingCount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100">
                <button
                  onClick={handleGenerate}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-indigo-200 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>解析中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <span>AIで整理する</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-800 text-lg">要確認論点一覧</h3>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              全 {totalItems} 件
            </span>
          </div>

          {issueItems.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-bold text-slate-700 mb-2">論点データがありません</h3>
              <p className="text-slate-500 mb-6 text-sm">左側の「AIで整理する」ボタンをクリックして、<br />ヒアリング情報から論点候補を抽出してください。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {issueItems.map(item => (
                <div 
                  key={item.id} 
                  className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
                    item.status === 'verified' ? 'border-green-200 bg-green-50/30' :
                    item.status === 'needs_revision' ? 'border-red-200 bg-red-50/30' :
                    item.status === 'not_applicable' ? 'border-slate-200 opacity-60 bg-slate-50' :
                    'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      {item.status === 'verified' ? (
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      ) : item.status === 'needs_revision' ? (
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                      ) : item.status === 'not_applicable' ? (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold">?</span>
                        </div>
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                          {item.riskLevel === 'high' && <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">高リスク</span>}
                          {item.riskLevel === 'medium' && <span className="text-[10px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded">中リスク</span>}
                        </div>
                        <h4 className="font-bold text-slate-800">{item.title}</h4>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pl-9 mb-4">
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{item.summary}</p>
                    {item.sourceReference && (
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        出典: {item.sourceReference}
                      </p>
                    )}
                  </div>
                  
                  <div className="pl-9 pt-3 border-t border-slate-100">
                    {renderContextualButtons(item)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-slate-200">
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
