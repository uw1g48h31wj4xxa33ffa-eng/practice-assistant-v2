"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCases } from '@/hooks/useCases';
import { workflowTemplates } from '@/config/workflowTemplates';
import { SubsidyScheduleItem } from '@/types';
import { buildMockScheduleFromRequiredDocuments } from '@/lib/ai/mockScheduleGenerator';
import Chip from '@/components/ui/Chip';

export default function SubsidySchedulePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const { cases, updateCase } = useCases();
  
  const [isClient, setIsClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
    
  const currentStepIndex = template?.steps.findIndex(s => s.id === 'schedule_management') ?? -1;
  const nextStep = template && currentStepIndex >= 0 && currentStepIndex + 1 < template.steps.length
    ? template.steps[currentStepIndex + 1]
    : null;

  const scheduleItems = currentCase.subsidyScheduleItems || [];
  const requiredDocuments = currentCase.requiredDocuments || [];

  // 進捗算出
  const totalItems = scheduleItems.length;
  const doneItems = scheduleItems.filter(s => s.progressStatus === 'done').length;
  const progressPercent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
  const remainingCount = totalItems - doneItems;

  // 上書き可能判定
  const hasExistingProgress = scheduleItems.some(
    s => s.progressStatus === 'in_progress' || s.progressStatus === 'done'
  );

  const handleGenerate = () => {
    if (requiredDocuments.length === 0) {
      alert('必要資料リストがありません。「必要資料整理」工程で先に資料リストを生成してください。');
      return;
    }
    
    if (hasExistingProgress && scheduleItems.length > 0) {
      if (!window.confirm('作業済みの状態がすべてリセットされます。本当に再生成しますか？')) {
        return;
      }
    }
    
    setIsGenerating(true);
    
    setTimeout(() => {
      const generated = buildMockScheduleFromRequiredDocuments(requiredDocuments);
      updateCase(caseId, { subsidyScheduleItems: generated });
      setIsGenerating(false);
    }, 1500);
  };

  const handleStatusChange = (itemId: string, newStatus: SubsidyScheduleItem['progressStatus']) => {
    const updated = scheduleItems.map(item => 
      item.id === itemId ? { ...item, progressStatus: newStatus } : item
    );
    updateCase(caseId, { subsidyScheduleItems: updated });
  };

  const handleNextStep = () => {
    if (currentCase.progressStatus === 'schedule_management') {
      updateCase(caseId, { progressStatus: 'ai_review' });
    }
    if (nextStep?.href) {
      router.push(nextStep.href.replace('[id]', caseId));
    } else {
      router.push(`/cases/${caseId}/ai-evidence`);
    }
  };

  // 時系列グループ分け
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const nextWeekDate = new Date(todayDate);
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);

  const todayStr = todayDate.toISOString().split('T')[0];

  const todayTasks = scheduleItems.filter(s => {
    const d = new Date(s.dueDate);
    d.setHours(0, 0, 0, 0);
    return d <= todayDate && s.progressStatus !== 'done';
  }).sort((a, b) => {
    if (a.importance === 'high' && b.importance !== 'high') return -1;
    if (a.importance !== 'high' && b.importance === 'high') return 1;
    return 0;
  });

  const groupedItems = {
    today: scheduleItems.filter(s => {
      const d = new Date(s.dueDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === todayDate.getTime();
    }),
    tomorrow: scheduleItems.filter(s => {
      const d = new Date(s.dueDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === tomorrowDate.getTime();
    }),
    thisWeek: scheduleItems.filter(s => {
      const d = new Date(s.dueDate);
      d.setHours(0, 0, 0, 0);
      return d > tomorrowDate && d < nextWeekDate;
    }),
    nextWeekOrLater: scheduleItems.filter(s => {
      const d = new Date(s.dueDate);
      d.setHours(0, 0, 0, 0);
      return d >= nextWeekDate;
    }),
  };

  const renderContextualButtons = (item: SubsidyScheduleItem) => {
    // スマホ用: 現在の状態に応じた主要操作のみを表示
    if (item.progressStatus === 'not_started') {
      return (
        <>
          <button onClick={() => handleStatusChange(item.id, 'in_progress')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-indigo-50 text-indigo-700 border-indigo-200">進行中にする</button>
          <button onClick={() => handleStatusChange(item.id, 'done')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200">完了にする</button>
        </>
      );
    } else if (item.progressStatus === 'in_progress') {
      return (
        <>
          <button onClick={() => handleStatusChange(item.id, 'done')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-green-50 text-green-700 border-green-200">完了にする</button>
          <button onClick={() => handleStatusChange(item.id, 'not_started')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-slate-100 text-slate-600 border-slate-300">未着手に戻す</button>
        </>
      );
    } else if (item.progressStatus === 'done') {
      return (
        <button onClick={() => handleStatusChange(item.id, 'in_progress')} className="flex-1 min-h-[44px] rounded-lg text-xs font-bold transition-colors border bg-indigo-50 text-indigo-700 border-indigo-200">進行中に戻す</button>
      );
    }
    return null;
  };

  const renderScheduleCard = (item: SubsidyScheduleItem) => (
    <div key={item.id} className={`bg-white p-4 rounded-xl border shadow-sm transition-colors ${
      item.progressStatus === 'done' ? 'border-slate-200 opacity-75 bg-slate-50' : 
      item.progressStatus === 'in_progress' ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-100'
    }`}>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {item.dueDate}
            </span>
            {item.importance === 'high' && (
              <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold">重要</span>
            )}
            <h4 className={`font-bold text-base truncate ${item.progressStatus === 'done' ? 'text-slate-500' : 'text-slate-800'}`}>
              {item.title}
            </h4>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              担当: {item.assignee || '未定'}
            </span>
            {item.aiMemo && (
              <span className="truncate max-w-[200px]">備考: {item.aiMemo}</span>
            )}
          </div>
        </div>
        
        <div className="shrink-0 w-full xl:w-auto">
          {/* PC用: 3つのボタンを横並び */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => handleStatusChange(item.id, 'not_started')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                item.progressStatus === 'not_started' 
                  ? 'bg-slate-100 text-slate-700 border-slate-300' 
                  : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
              }`}
            >
              未着手
            </button>
            <button
              onClick={() => handleStatusChange(item.id, 'in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                item.progressStatus === 'in_progress' 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              進行中
            </button>
            <button
              onClick={() => handleStatusChange(item.id, 'done')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                item.progressStatus === 'done' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              完了
            </button>
          </div>

          {/* スマホ用: コンテキストに応じた主要操作ボタン */}
          <div className="flex sm:hidden items-center gap-2 w-full mt-3">
            {renderContextualButtons(item)}
          </div>
        </div>
      </div>
    </div>
  );

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
          <span>締切: {currentCase.dueDate}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">スケジュール管理</h2>
          <p className="text-sm text-slate-500 mt-1">AIが必要資料から生成した予定を確認し、進捗を管理します。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側: サマリー＆今日対応 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-800 mb-6 self-start">スケジュール全体進捗</h3>
            
            {totalItems > 0 ? (
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
                      <span className="text-[10px] text-slate-500 mt-1 font-bold">あと{remainingCount}工程</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 font-medium">予定がありません</p>
                <p className="text-xs text-slate-400 mt-1 mb-6">AIによる予定生成を開始してください</p>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      予定生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      AIで予定を生成
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {totalItems > 0 && todayTasks.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                今日対応
              </h3>
              <div className="space-y-2">
                {todayTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="bg-white rounded-lg p-3 border border-red-100 text-sm">
                    <div className="font-bold text-slate-800">{task.title}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip label={task.progressStatus === 'in_progress' ? '進行中' : '未着手'} color={task.progressStatus === 'in_progress' ? 'indigo' : 'slate'} variant="subtle" size="xs" />
                      <span className="text-xs text-red-500 font-bold">{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右側: 予定一覧 */}
        <div className="lg:col-span-2 space-y-6">
          {totalItems > 0 ? (
            <>
              {groupedItems.today.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    今日
                  </h3>
                  <div className="flex flex-col gap-3">
                    {groupedItems.today.map(renderScheduleCard)}
                  </div>
                </div>
              )}
              
              {groupedItems.tomorrow.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    明日
                  </h3>
                  <div className="flex flex-col gap-3">
                    {groupedItems.tomorrow.map(renderScheduleCard)}
                  </div>
                </div>
              )}

              {groupedItems.thisWeek.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    今週
                  </h3>
                  <div className="flex flex-col gap-3">
                    {groupedItems.thisWeek.map(renderScheduleCard)}
                  </div>
                </div>
              )}

              {groupedItems.nextWeekOrLater.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                    来週以降
                  </h3>
                  <div className="flex flex-col gap-3">
                    {groupedItems.nextWeekOrLater.map(renderScheduleCard)}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 disabled:opacity-50"
                >
                  {isGenerating ? '再生成中...' : '予定を再生成する'}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">予定が未作成です</h3>
              <p className="text-sm text-slate-500 max-w-md">
                左側のパネルから「AIで予定を生成」ボタンをクリックして、<br className="hidden sm:block" />
                必要資料に基づいたスケジュールを自動生成してください。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 下部アクション */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">スケジュール管理が完了したら次へ進んでください</h3>
          <p className="text-xs text-slate-500 mt-1">次の工程ではエビデンス等の最終検証を行います</p>
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
