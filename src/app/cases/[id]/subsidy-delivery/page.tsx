"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCases } from '@/hooks/useCases';
import { workflowTemplates } from '@/config/workflowTemplates';
import { SubsidyDeliveryItem } from '@/types';
import { buildMockDeliveryItems } from '@/lib/ai/mockDeliveryGenerator';
import { GenerationResultDTO } from '@/lib/document-generation/dto';
import { HATARAKIKATA_MAPPINGS } from '@/lib/document-generation/field-mappings/hatarakikata-r8-form1';

export default function SubsidyDeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const { cases, updateCase } = useCases();
  
  const [isClient, setIsClient] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResultDTO | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const template = currentCase.templateId 
    ? workflowTemplates.find(t => t.id === currentCase.templateId) 
    : undefined;

  const deliveryItems = currentCase.subsidyDeliveryItems || [];

  const totalItems = deliveryItems.length;
  
  const completedCount = deliveryItems.filter(i => 
    i.completionStatus === 'completed' || i.completionStatus === 'not_required'
  ).length;

  const incompleteCount = deliveryItems.filter(i => 
    i.completionStatus === 'incomplete'
  ).length;

  const issueFoundCount = deliveryItems.filter(i => 
    i.completionStatus === 'issue_found'
  ).length;

  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const remainingCount = totalItems - completedCount;
  const hasIncomplete = (incompleteCount > 0 || issueFoundCount > 0);

  const handleGenerate = () => {
    if (deliveryItems.length > 0) {
      const hasModified = deliveryItems.some(i => i.completionStatus !== 'incomplete');
      if (hasModified) {
        if (!window.confirm('すでに確認済みの項目が含まれています。再生成して上書きしてもよろしいですか？')) {
          return;
        }
      }
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const generated = buildMockDeliveryItems(currentCase);
      updateCase(caseId, { subsidyDeliveryItems: generated });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleGenerateWord = async () => {
    setIsGeneratingWord(true);
    setDownloadId(null);
    setGenerationResult(null);
    try {
      // Build WordGenerationRequestDTO
      const confirmedFields = (currentCase.extractedItems || [])
        .filter(item => item.status === 'verified' || item.status === 'modified')
        .map(item => {
          const mapping = HATARAKIKATA_MAPPINGS.find(m => m.extractedCategory === item.category);
          if (!mapping) return null;
          return {
            fieldId: mapping.documentFieldId,
            value: item.content,
            sourceExtractedInfoId: item.id,
            verificationStatus: item.status as "verified" | "modified"
          };
        })
        .filter((f): f is NonNullable<typeof f> => f !== null);

      const requestDto = {
        caseId: currentCase.id,
        templateId: 'hatarakikata-r8-form1',
        effectiveDate: new Date().toISOString(),
        confirmedFields
      };

      const res = await fetch('/api/document/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestDto),
      });

      const data = await res.json();
      setGenerationResult(data);

      if (!res.ok || !data.success) {
        // Find errors
        const errorMsg = data.errors?.map((e: {message?: string} | string) => typeof e === 'string' ? e : e.message).join(', ') || 'Word文書の生成に失敗しました';
        throw new Error(errorMsg);
      }

      setDownloadId(data.downloadId);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      alert(err.message);
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!downloadId) return;
    try {
      const res = await fetch(`/api/document/download/${downloadId}`);
      if (!res.ok) throw new Error('ダウンロードに失敗しました');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (generationResult as {outputFileName?: string})?.outputFileName || `practice_assistant_${currentCase.id}_output.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      alert(err.message);
    }
  };

  const handleStatusChange = (itemId: string, newStatus: SubsidyDeliveryItem['completionStatus']) => {
    const updated = deliveryItems.map(item => 
      item.id === itemId ? { ...item, completionStatus: newStatus } : item
    );
    updateCase(caseId, { subsidyDeliveryItems: updated });

    setTimeout(() => {
      const currentIndex = deliveryItems.findIndex(i => i.id === itemId);
      if (currentIndex === -1) return;

      const nextIncomplete = updated.slice(currentIndex + 1).find(i => 
        i.completionStatus === 'incomplete' || i.completionStatus === 'issue_found'
      );

      if (nextIncomplete) {
        document.getElementById(`delivery-card-${nextIncomplete.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const allCompleted = updated.every(i => i.completionStatus === 'completed' || i.completionStatus === 'not_required');
        if (allCompleted) {
          document.getElementById('next-action-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50);
  };

  const handleCompleteCase = () => {
    if (hasIncomplete) {
      if (!window.confirm('未確認や要修正項目が残っていますが、案件を完了してよろしいですか？')) {
        return;
      }
    }
    
    updateCase(caseId, { progressStatus: 'completed' });
    router.push(`/cases/${caseId}`);
  };

  const getMobileTitle = (title: string) => {
    if (title.includes('必須資料の受領確認')) return '必須資料の確認';
    if (title.includes('期限・提出日の確認')) return '期限・提出日確認';
    if (title.includes('gBizID等の準備確認')) return 'gBizID等の準備';
    if (title.includes('提出前の最終確認')) return '最終確認';
    return title;
  };

  const getMobilePurpose = (purpose: string) => {
    if (purpose.includes('提出必須となっているすべての資料が手元に')) return '提出必須資料が手元に揃っているか確認します。';
    if (purpose.includes('事業計画書や見積書の内容が公募要項の要件に合致')) return '事業計画書・見積書が要件に合致しているか確認します。';
    if (purpose.includes('電子申請システムへのログイン情報')) return '電子申請のログイン情報が有効か確認します。';
    if (purpose.includes('指定されたファイル形式・ファイルサイズ要件')) return 'ファイル形式やサイズが要件を満たしているか確認します。';
    if (purpose.includes('前の工程でAIが整理したエビデンス・根拠がすべて確認済')) return 'AIエビデンスがすべて確認済か確認します。';
    if (purpose.includes('これまでに洗い出された要修正項目がすべて解消')) return '要修正項目が解消されているか確認します。';
    if (purpose.includes('すべての準備が整い、顧客への最終報告')) return 'すべての準備を完了し、顧客へ報告します。';
    return purpose;
  };

  const renderContextualButtons = (item: SubsidyDeliveryItem) => {
    const status = item.completionStatus;
    if (status === 'incomplete') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'completed')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">確認済</button>
          <button onClick={() => handleStatusChange(item.id, 'issue_found')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-red-50 text-red-700 border-red-200 whitespace-nowrap">要修正</button>
          <button onClick={() => handleStatusChange(item.id, 'not_required')} className="px-3 shrink-0 min-h-[44px] rounded-lg text-[10px] font-bold transition-colors border bg-slate-100 text-slate-500 border-slate-200 whitespace-nowrap">対象外</button>
        </div>
      );
    } else if (status === 'completed') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'issue_found')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-red-50 text-red-700 border-red-200 whitespace-nowrap">要修正</button>
          <button onClick={() => handleStatusChange(item.id, 'incomplete')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">未確認</button>
        </div>
      );
    } else if (status === 'issue_found') {
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'completed')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200 whitespace-nowrap">確認済</button>
          <button onClick={() => handleStatusChange(item.id, 'incomplete')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">未確認</button>
        </div>
      );
    } else {
      // not_required
      return (
        <div className="flex w-full gap-2">
          <button onClick={() => handleStatusChange(item.id, 'incomplete')} className="w-full min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap">未確認</button>
        </div>
      );
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                納品・提出準備
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
                      チェックリストを生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      提出前リストを生成
                    </>
                  )}
                </button>
                <button
                  onClick={handleGenerateWord}
                  disabled={isGeneratingWord}
                  className="w-full mt-3 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm disabled:opacity-50"
                >
                  {isGeneratingWord ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Word文書を生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Word文書を生成
                    </>
                  )}
                </button>
                {downloadId && (
                  <button
                    onClick={handleDownloadWord}
                    className="w-full mt-3 py-3 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-green-200 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Word文書をダウンロード
                  </button>
                )}
                {generationResult && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
                    <p className="font-bold mb-1">生成結果:</p>
                    <p>成功: {generationResult.success ? 'はい' : 'いいえ'}</p>
                    {generationResult.manualCheck && (
                      <p className="text-yellow-600">Manual Check Required</p>
                    )}
                    {generationResult.humanReview && (
                      <p className="text-blue-600">Human Review Required</p>
                    )}
                    {(generationResult.warnings?.length ?? 0) > 0 && (
                      <p className="text-orange-600">Warnings: {generationResult.warnings?.length}件</p>
                    )}
                    {(generationResult.errors?.length ?? 0) > 0 && (
                      <p className="text-red-600">Errors: {generationResult.errors?.map((e: {message?: string} | string) => typeof e === 'string' ? e : e.message).join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 要確認項目 */}
          {issueFoundCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                要修正項目
              </h3>
              <ul className="space-y-2">
                {deliveryItems.filter(i => i.completionStatus === 'issue_found').map(i => (
                  <li key={i.id} className="text-sm text-red-700 bg-white rounded-lg p-2 border border-red-100 flex items-center justify-between">
                    <span className="truncate mr-2 font-bold">
                      {getMobileTitle(i.title)}
                    </span>
                    <button 
                      onClick={() => document.getElementById(`delivery-card-${i.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
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
              {deliveryItems.map(item => (
                <div key={item.id} id={`delivery-card-${item.id}`} className={`bg-white p-5 sm:p-6 rounded-xl border shadow-sm transition-colors ${
                  item.completionStatus === 'completed' || item.completionStatus === 'not_required' ? 'border-slate-200 opacity-75' : 
                  item.completionStatus === 'issue_found' ? 'border-red-300 bg-red-50/30' : 'border-slate-200 hover:border-indigo-100'
                }`}>
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {item.importance === 'high' && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold shrink-0">高重要度</span>
                          )}
                          <span className={`sm:hidden px-2 py-0.5 border rounded text-[10px] font-bold shrink-0 ${
                            item.completionStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.completionStatus === 'issue_found' ? 'bg-red-50 text-red-700 border-red-200' :
                            item.completionStatus === 'not_required' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                            'bg-slate-100 text-slate-600 border-slate-300'
                          }`}>
                            {item.completionStatus === 'completed' ? '確認済' :
                             item.completionStatus === 'issue_found' ? '要修正' :
                             item.completionStatus === 'not_required' ? '対象外' : '未確認'}
                          </span>
                        </div>
                        <h4 className={`font-bold block w-full min-w-0 break-words break-all line-clamp-2 leading-snug overflow-hidden text-[15px] sm:text-base ${
                          item.completionStatus === 'completed' || item.completionStatus === 'not_required' ? 'text-slate-500' : 'text-slate-800'
                        }`}>
                          <span className="sm:hidden">{getMobileTitle(item.title)}</span>
                          <span className="hidden sm:inline">{item.title}</span>
                        </h4>
                      </div>
                      <p className="text-[13px] sm:text-xs text-slate-500 mb-2 leading-[1.8] sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                        <span className="sm:hidden">{getMobilePurpose(item.purpose)}</span>
                        <span className="hidden sm:inline">{item.purpose}</span>
                      </p>
                      
                      {item.aiMemo && (
                        <div className="flex items-start gap-1.5 mt-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                          <svg className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{item.aiMemo}</p>
                        </div>
                      )}

                      {item.cautionNote && (
                        <div className="flex items-start gap-1.5 mt-2 p-3 bg-red-50/50 rounded-lg border border-red-100">
                          <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-[11px] text-red-700 font-bold leading-relaxed">{item.cautionNote}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="shrink-0 w-full xl:w-auto mt-2 xl:mt-0">
                      {/* PC用: 横並び */}
                      <div className="hidden sm:flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(item.id, 'completed')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            item.completionStatus === 'completed' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          確認済
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'issue_found')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            item.completionStatus === 'issue_found' 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          要修正
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'not_required')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            item.completionStatus === 'not_required' 
                              ? 'bg-slate-100 text-slate-600 border-slate-300' 
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          対象外
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'incomplete')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            item.completionStatus === 'incomplete' 
                              ? 'bg-slate-100 text-slate-700 border-slate-300' 
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          未確認
                        </button>
                      </div>

                      {/* スマホ用: コンテキストに応じた主要操作ボタン */}
                      <div className="flex sm:hidden items-center gap-2 w-full mt-1">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">チェックリストがありません</h3>
              <p className="text-sm text-slate-500 max-w-md">
                左側のパネルから「提出前チェックリストを生成」をクリックして、<br className="hidden sm:block" />
                提出に向けた最終確認を実施してください。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 下部アクション */}
      <div id="next-action-area" className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">すべての準備が完了したら案件を完了します</h3>
          {hasIncomplete ? (
            <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              未確認または要修正の項目が残っていますが、完了させることは可能です
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">案件一覧へ戻ります</p>
          )}
        </div>
        <button
          onClick={handleCompleteCase}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          案件を完了する
        </button>
      </div>
    </div>
  );
}
