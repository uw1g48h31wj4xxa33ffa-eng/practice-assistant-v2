"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCases } from '@/hooks/useCases';
import { workflowTemplates } from '@/config/workflowTemplates';
import { RequiredDocument } from '@/types';
import { buildMockRequiredDocumentsFromGuidelineItems, buildMockLaborConsultingDocuments } from '@/lib/ai/mockRequiredDocumentsGenerator';
import Chip from '@/components/ui/Chip';

export default function RequiredDocumentsPage() {
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
    
  const currentStepIndex = template?.steps.findIndex(s => s.id === 'document_prep') ?? -1;
  const nextStep = template && currentStepIndex >= 0 && currentStepIndex + 1 < template.steps.length
    ? template.steps[currentStepIndex + 1]
    : null;

  const isLaborConsulting = currentCase.templateId === 'labor_consulting_v1' || (!currentCase.templateId && currentCase.caseType === '労務相談');

  const requiredDocuments = currentCase.requiredDocuments || [];

  // 算出
  const totalDocs = requiredDocuments.length;
  const receivedDocs = requiredDocuments.filter(d => d.status === 'received').length;
  const notNeededDocs = requiredDocuments.filter(d => d.status === 'not_needed').length;
  const requestedDocs = requiredDocuments.filter(d => d.status === 'requested').length;
  const notStartedDocs = requiredDocuments.filter(d => d.status === 'not_started').length;

  const completedCount = receivedDocs + notNeededDocs;
  const progressPercent = totalDocs > 0 ? Math.round((completedCount / totalDocs) * 100) : 0;
  const remainingCount = totalDocs - completedCount;

  // 未完了の必須資料の確認
  const uncompletedRequiredDocs = requiredDocuments.filter(
    d => d.requiredType === 'required' && (d.status === 'not_started' || d.status === 'requested')
  );
  const hasUncompletedRequired = uncompletedRequiredDocs.length > 0;

  // 次に対応すべき資料 (priority high, or early dueDate, not completed)
  const nextActionDocs = requiredDocuments
    .filter(d => d.status === 'not_started' || d.status === 'requested')
    .sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    });

  // 上書き可能判定
  const hasExistingProgress = requiredDocuments.some(
    d => d.status === 'received' || d.status === 'requested' || d.status === 'not_needed'
  );

  const handleGenerate = () => {
    if (hasExistingProgress) {
      if (!window.confirm('作業済みの状態がすべてリセットされます。本当に再生成しますか？')) {
        return;
      }
    }
    setIsAnalyzing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      let generated;
      if (isLaborConsulting) {
        generated = buildMockLaborConsultingDocuments();
      } else {
        generated = buildMockRequiredDocumentsFromGuidelineItems(currentCase.subsidyGuidelineItems || []);
      }
      updateCase(caseId, { requiredDocuments: generated });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleStatusChange = (docId: string, newStatus: RequiredDocument['status']) => {
    const updated = requiredDocuments.map(d => 
      d.id === docId ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d
    );
    updateCase(caseId, { requiredDocuments: updated });

    setTimeout(() => {
      const currentIndex = requiredDocuments.findIndex(d => d.id === docId);
      if (currentIndex === -1) return;
      
      const nextIncomplete = updated.slice(currentIndex + 1).find(d => 
        (d.status || 'not_started') !== 'received' && (d.status || 'not_started') !== 'not_needed'
      );
      
      if (nextIncomplete) {
        document.getElementById(`doc-card-${nextIncomplete.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const allCompleted = updated.every(d => (d.status || 'not_started') === 'received' || (d.status || 'not_started') === 'not_needed');
        if (allCompleted) {
          document.getElementById('next-action-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50);
  };

  const handleNextStep = () => {
    if (currentCase.progressStatus === 'guideline_review' || currentCase.progressStatus === 'document_prep') {
      updateCase(caseId, { progressStatus: 'schedule_management' });
    }
    if (nextStep?.href) {
      router.push(nextStep.href.replace('[id]', caseId));
    } else {
      router.push(`/cases/${caseId}/subsidy-schedule`);
    }
  };

  const renderContextualButtons = (doc: RequiredDocument) => {
    // スマホ用: 現在の状態に応じた主要操作のみを表示
    const status = doc.status || 'not_started';
    if (status === 'not_started') {
      return (
        <>
          <button onClick={() => handleStatusChange(doc.id, 'requested')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap">依頼中</button>
          <button onClick={() => handleStatusChange(doc.id, 'received')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">受領済</button>
          <button onClick={() => handleStatusChange(doc.id, 'not_needed')} className="px-3 shrink-0 min-h-[44px] rounded-lg text-[10px] font-bold transition-colors border bg-slate-100 text-slate-500 border-slate-200 whitespace-nowrap">不要</button>
        </>
      );
    } else if (status === 'requested') {
      return (
        <>
          <button onClick={() => handleStatusChange(doc.id, 'received')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">受領済</button>
          <button onClick={() => handleStatusChange(doc.id, 'not_started')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">未着手</button>
          <button onClick={() => handleStatusChange(doc.id, 'not_needed')} className="px-3 shrink-0 min-h-[44px] rounded-lg text-[10px] font-bold transition-colors border bg-slate-100 text-slate-500 border-slate-200 whitespace-nowrap">不要</button>
        </>
      );
    } else if (status === 'received') {
      return (
        <>
          <button onClick={() => handleStatusChange(doc.id, 'requested')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap">依頼中</button>
          <button onClick={() => handleStatusChange(doc.id, 'not_started')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">未着手</button>
        </>
      );
    } else if (status === 'not_needed') {
      return (
        <button onClick={() => handleStatusChange(doc.id, 'not_started')} className="w-full min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">未着手</button>
      );
    }
    
    // 未知の値の場合もnot_startedとして扱う
    return (
      <>
        <button onClick={() => handleStatusChange(doc.id, 'requested')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap">依頼中</button>
        <button onClick={() => handleStatusChange(doc.id, 'received')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">受領済</button>
        <button onClick={() => handleStatusChange(doc.id, 'not_needed')} className="px-3 shrink-0 min-h-[44px] rounded-lg text-[10px] font-bold transition-colors border bg-slate-100 text-slate-500 border-slate-200 whitespace-nowrap">不要</button>
      </>
    );
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
        <h1 className="text-xl font-bold text-slate-800 line-clamp-1">{currentCase.title}</h1>
        <div className="ml-auto flex items-center gap-4 text-sm text-slate-600 hidden sm:flex">
          <span>{currentCase.clientName}</span>
          <span>納期: {currentCase.dueDate}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{isLaborConsulting ? '関連資料整理' : '必要資料整理'}</h2>
          <p className="text-sm text-slate-500 mt-1">AIが抽出した要件をもとに、必要な資料を整理・管理します。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側: サマリー＆進捗 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-800 mb-6 self-start">資料準備 全体進捗</h3>
            
            {totalDocs > 0 ? (
              <>
                <div className="relative w-40 h-40 mb-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4f46e5" strokeWidth="4" 
                      strokeDasharray={`${progressPercent}, 100`} 
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                    <span className="text-3xl font-extrabold text-slate-800 leading-none tracking-tight">{progressPercent}<span className="text-xl font-bold">%</span></span>
                    {remainingCount > 0 && (
                      <span className="text-[10px] text-slate-500 mt-1 font-bold">あと{remainingCount}件</span>
                    )}
                  </div>
                </div>
                
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span>
                      <span className="text-slate-600 font-medium">完了 (受領済/不要)</span>
                    </div>
                    <span className="font-bold text-slate-800">{completedCount}件</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span>
                      <span className="text-slate-600 font-medium">依頼中</span>
                    </div>
                    <span className="font-bold text-slate-800">{requestedDocs}件</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                      <span className="text-slate-600 font-medium">未着手</span>
                    </div>
                    <span className="font-bold text-slate-800">{notStartedDocs}件</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 font-medium">資料リストがありません</p>
                <p className="text-xs text-slate-400 mt-1 mb-6">AIによる整理を開始してください</p>
                
                <button
                  onClick={handleGenerate}
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      リスト生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      AIで{isLaborConsulting ? '関連資料' : '必要資料'}を整理
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {totalDocs > 0 && nextActionDocs.length > 0 && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                次に対応すべき資料
              </h3>
              <div className="space-y-2">
                {nextActionDocs.slice(0, 3).map(doc => (
                  <div key={doc.id} className="bg-white rounded-lg p-3 border border-indigo-100 text-sm">
                    <div className="font-bold text-slate-800">{doc.name}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip label={doc.status === 'requested' ? '依頼中' : '未着手'} color={doc.status === 'requested' ? 'amber' : 'slate'} variant="subtle" size="xs" />
                      {doc.priority === 'high' && <Chip label="優先:高" color="red" variant="subtle" size="xs" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右側: 資料一覧 */}
        <div className="lg:col-span-2 space-y-4">
          {totalDocs > 0 ? (
            <div className="flex flex-col gap-3">
              {requiredDocuments.map(doc => (
                <div key={doc.id} id={`doc-card-${doc.id}`} className={`bg-white p-4 rounded-xl border shadow-sm transition-colors ${
                  doc.status === 'received' || doc.status === 'not_needed' ? 'border-slate-200 opacity-75' : 
                  doc.status === 'requested' ? 'border-amber-200' : 'border-slate-200 hover:border-indigo-100'
                }`}>
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 mb-1">
                        <div className="flex flex-wrap items-center gap-1">
                          {doc.requiredType === 'required' ? (
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold shrink-0">必須</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-[10px] font-bold shrink-0">任意</span>
                          )}
                          {doc.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold shrink-0">優先:高</span>
                          )}
                          <span className={`sm:hidden px-2 py-0.5 border rounded text-[10px] font-bold shrink-0 ${
                            (doc.status || 'not_started') === 'received' ? 'bg-green-50 text-green-700 border-green-200' :
                            (doc.status || 'not_started') === 'requested' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            (doc.status || 'not_started') === 'not_needed' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                            'bg-slate-100 text-slate-600 border-slate-300'
                          }`}>
                            {(doc.status || 'not_started') === 'received' ? '受領済' :
                             (doc.status || 'not_started') === 'requested' ? '依頼中' :
                             (doc.status || 'not_started') === 'not_needed' ? '不要' : '未着手'}
                          </span>
                        </div>
                        <h4 className={`font-bold block w-full min-w-0 break-words break-all line-clamp-2 leading-snug overflow-hidden text-[15px] sm:text-base ${
                          doc.status === 'received' || doc.status === 'not_needed' ? 'text-slate-500' : 'text-slate-800'
                        }`}>{doc.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mb-2 line-clamp-1">{doc.reason}</p>
                    </div>
                    
                    <div className="shrink-0 w-full xl:w-auto">
                      {/* PC用: 4つのボタンを横並び */}
                      <div className="hidden sm:flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(doc.id, 'received')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            doc.status === 'received' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          受領済
                        </button>
                        <button
                          onClick={() => handleStatusChange(doc.id, 'requested')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            doc.status === 'requested' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          依頼中
                        </button>
                        <button
                          onClick={() => handleStatusChange(doc.id, 'not_needed')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            doc.status === 'not_needed' 
                              ? 'bg-slate-100 text-slate-500 border-slate-200' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          不要
                        </button>
                        <button
                          onClick={() => handleStatusChange(doc.id, 'not_started')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            doc.status === 'not_started' 
                              ? 'bg-slate-100 text-slate-700 border-slate-300' 
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          未着手
                        </button>
                      </div>

                      {/* スマホ用: コンテキストに応じた主要操作ボタン */}
                      <div className="flex sm:hidden items-center gap-2 w-full mt-2">
                        {renderContextualButtons(doc)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={isAnalyzing}
                  className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 disabled:opacity-50"
                >
                  {isAnalyzing ? '再生成中...' : '資料リストを再生成する'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">資料リストが未作成です</h3>
              <p className="text-sm text-slate-500 max-w-md">
                「AIで{isLaborConsulting ? '関連資料' : '必要資料'}を整理」ボタンをクリックして、<br className="hidden sm:block" />
                要項に基づいた資料リストを自動生成してください。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 下部アクション */}
      <div id="next-action-area" className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{isLaborConsulting ? '関連資料' : '必要資料'}の整理が完了したら次へ進んでください</h3>
          {hasUncompletedRequired ? (
            <p className="text-xs font-bold text-amber-600 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              未完了の必須資料が {uncompletedRequiredDocs.length} 件残っていますが、進めることは可能です
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">次の工程ではスケジュールの管理を行います</p>
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
