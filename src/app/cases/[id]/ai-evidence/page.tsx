"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCases } from '@/hooks/useCases';
import { workflowTemplates } from '@/config/workflowTemplates';
import { EvidenceItem } from '@/types';
import { buildMockEvidenceItems } from '@/lib/ai/mockEvidenceGenerator';

export default function AIEvidencePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const { cases, updateCase } = useCases();
  
  const [isClient, setIsClient] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentCase = cases.find(c => c.id === caseId);

  if (!isClient) return null;

  if (!currentCase) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-red-600 mb-4">エラー</h1>
        <p>案件が見つかりません。</p>
        <Link href="/cases" className="text-indigo-600 hover:underline mt-4 inline-block">一覧へ戻る</Link>
      </div>
    );
  }

  const template = currentCase.templateId 
    ? workflowTemplates.find(t => t.id === currentCase.templateId) 
    : undefined;
    
  const currentStepIndex = template?.steps.findIndex(s => s.id === 'ai_evidence') ?? -1;
  const nextStep = template && currentStepIndex >= 0 && currentStepIndex + 1 < template.steps.length
    ? template.steps[currentStepIndex + 1]
    : null;

  const evidenceItems = currentCase.evidenceItems || [];

  const totalItems = evidenceItems.length;
  const verifiedCount = evidenceItems.filter(i => i.status === 'verified').length;
  const notApplicableCount = evidenceItems.filter(i => i.status === 'not_applicable').length;
  const needsRevisionCount = evidenceItems.filter(i => i.status === 'needs_revision').length;
  const uncheckedCount = evidenceItems.filter(i => i.status === 'unchecked').length;

  const completedCount = verifiedCount + notApplicableCount;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const remainingCount = totalItems - completedCount;
  const hasIncomplete = (needsRevisionCount > 0 || uncheckedCount > 0);

  const handleGenerate = () => {
    // 上書き防止チェック
    if (evidenceItems.length > 0) {
      const hasModified = evidenceItems.some(i => i.status !== 'unchecked');
      if (hasModified) {
        if (!window.confirm('すでに確認済みの検証結果が含まれています。再生成して上書きしてもよろしいですか？')) {
          return;
        }
      }
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const generated = buildMockEvidenceItems(currentCase);
      updateCase(caseId, { evidenceItems: generated });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleStatusChange = (itemId: string, newStatus: EvidenceItem['status']) => {
    const updated = evidenceItems.map(item => 
      item.id === itemId ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
    );
    updateCase(caseId, { evidenceItems: updated });

    setTimeout(() => {
      const currentIndex = evidenceItems.findIndex(i => i.id === itemId);
      if (currentIndex === -1) return;

      const nextIncomplete = updated.slice(currentIndex + 1).find(i => 
        (i.status || 'unchecked') === 'unchecked' || (i.status || 'unchecked') === 'needs_revision'
      );

      if (nextIncomplete) {
        document.getElementById(`evidence-card-${nextIncomplete.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const allCompleted = updated.every(i => (i.status || 'unchecked') === 'verified' || (i.status || 'unchecked') === 'not_applicable');
        if (allCompleted) {
          document.getElementById('next-action-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50);
  };

  const handleNextStep = () => {
    if (currentCase.progressStatus === 'ai_evidence') {
      updateCase(caseId, { progressStatus: 'delivery_prep' });
    }
    if (nextStep?.href) {
      router.push(nextStep.href.replace('[id]', caseId));
    } else {
      router.push(`/cases/${caseId}/workflow/delivery_prep`);
    }
  };

  const renderContextualButtons = (item: EvidenceItem) => {
    const status = item.status || 'unchecked';
    if (status === 'unchecked') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'verified')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">確認済</button>
          <button onClick={() => handleStatusChange(item.id, 'needs_revision')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-red-50 text-red-700 border-red-200 whitespace-nowrap">要修正</button>
          <button onClick={() => handleStatusChange(item.id, 'not_applicable')} className="px-3 shrink-0 min-h-[44px] rounded-lg text-[10px] font-bold transition-colors border bg-slate-100 text-slate-500 border-slate-200 whitespace-nowrap">対象外</button>
        </div>
      );
    } else if (status === 'verified') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'needs_revision')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-red-50 text-red-700 border-red-200 whitespace-nowrap">要修正</button>
          <button onClick={() => handleStatusChange(item.id, 'unchecked')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">未確認</button>
        </div>
      );
    } else if (status === 'needs_revision') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'verified')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">確認済</button>
          <button onClick={() => handleStatusChange(item.id, 'unchecked')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">未確認</button>
        </div>
      );
    } else {
      // not_applicable
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'unchecked')} className="w-full min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">未確認</button>
        </div>
      );
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'guideline': return '要項';
      case 'document': return '資料';
      case 'schedule': return '予定';
      case 'risk': return 'リスク';
      case 'source': return '出典';
      default: return 'その他';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-soft-enter pb-12">
      {/* 案件情報サマリー */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Link href={`/cases/${caseId}`} className="text-slate-400 hover:text-indigo-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{currentCase.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{currentCase.clientName} | 担当: {currentCase.assignee}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側: サマリー＆進捗 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AI検証・エビデンス
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
                      <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AIで検証項目を生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      AIで検証項目を生成する
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* 要確認項目 */}
          {needsRevisionCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                要修正項目
              </h3>
              <ul className="space-y-2">
                {evidenceItems.filter(i => i.status === 'needs_revision').map(i => (
                  <li key={i.id} className="text-sm text-red-700 bg-white rounded-lg p-2 border border-red-100 flex items-center justify-between">
                    <span className="truncate mr-2 font-bold">{i.title}</span>
                    <button 
                      onClick={() => document.getElementById(`evidence-card-${i.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                      className="text-xs text-red-500 hover:text-red-800 shrink-0 border border-red-200 px-2 py-1 rounded bg-red-50"
                    >
                      確認
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 右側: 検証項目一覧 */}
        <div className="lg:col-span-2 space-y-4">
          {totalItems > 0 ? (
            <div className="flex flex-col gap-3">
              {evidenceItems.map(item => (
                <div key={item.id} id={`evidence-card-${item.id}`} className={`bg-white p-4 rounded-xl border shadow-sm transition-colors ${
                  item.status === 'verified' || item.status === 'not_applicable' ? 'border-slate-200 opacity-75' : 
                  item.status === 'needs_revision' ? 'border-red-300 bg-red-50/30' : 'border-slate-200 hover:border-indigo-100'
                }`}>
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 mb-1">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                            {getCategoryLabel(item.category)}
                          </span>
                          {item.riskLevel === 'high' && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold shrink-0">高リスク</span>
                          )}
                          <span className={`sm:hidden px-2 py-0.5 border rounded text-[10px] font-bold shrink-0 ${
                            item.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.status === 'needs_revision' ? 'bg-red-50 text-red-700 border-red-200' :
                            item.status === 'not_applicable' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                            'bg-slate-100 text-slate-600 border-slate-300'
                          }`}>
                            {item.status === 'verified' ? '確認済' :
                             item.status === 'needs_revision' ? '要修正' :
                             item.status === 'not_applicable' ? '対象外' : '未確認'}
                          </span>
                        </div>
                        <h4 className={`font-bold block w-full min-w-0 break-words break-all line-clamp-2 leading-snug overflow-hidden text-[15px] sm:text-base ${
                          item.status === 'verified' || item.status === 'not_applicable' ? 'text-slate-500' : 'text-slate-800'
                        }`}>{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mb-2 leading-relaxed">{item.summary}</p>
                      
                      {item.sourceReference && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          出典・根拠: {item.sourceReference}
                        </div>
                      )}
                    </div>
                    
                    <div className="shrink-0 w-full xl:w-auto">
                      {/* PC用: 横並び */}
                      <div className="hidden sm:flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(item.id, 'verified')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            item.status === 'verified' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          確認済
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'needs_revision')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            item.status === 'needs_revision' 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          要修正
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'not_applicable')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            item.status === 'not_applicable' 
                              ? 'bg-slate-100 text-slate-600 border-slate-300' 
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          対象外
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'unchecked')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            item.status === 'unchecked' 
                              ? 'bg-slate-100 text-slate-700 border-slate-300' 
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          未確認
                        </button>
                      </div>

                      {/* スマホ用: コンテキストに応じた主要操作ボタン */}
                      <div className="flex sm:hidden items-center gap-2 w-full mt-3">
                        {renderContextualButtons(item)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">検証項目がありません</h3>
              <p className="text-sm text-slate-500 max-w-md">
                左側のパネルから「AIで検証項目を生成する」をクリックして、<br className="hidden sm:block" />
                これまでに整理した内容の整合性を検証してください。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 下部アクション */}
      <div id="next-action-area" className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">検証が完了したら次へ進んでください</h3>
          {hasIncomplete ? (
            <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              未確認または要修正の項目が残っていますが、進めることは可能です
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">次の工程では納品・提出準備を行います</p>
          )}
        </div>
        <button
          onClick={handleNextStep}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
        >
          次の工程へ進む
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
