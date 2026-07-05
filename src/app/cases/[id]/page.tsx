"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import HumanApprovalBadge, { ReviewStatus } from '@/components/ui/HumanApprovalBadge';
import { getWorkflowTemplateById, getWorkflowTemplateByCaseType, getDefaultWorkflowTemplate } from '@/config/workflowTemplates';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const { getCaseById, updateCaseStatus, updateCase } = useCases();
  
  const initialCase = getCaseById(caseId);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('pending_review');

  useEffect(() => {
    if (initialCase) {
      setReviewStatus(initialCase.reviewStatus);
    }
  }, [initialCase]);

  const handleStatusChange = (status: ReviewStatus) => {
    setReviewStatus(status);
    updateCaseStatus(caseId, status);
  };

  // テンプレートの取得
  const template = initialCase 
    ? (getWorkflowTemplateById(initialCase.templateId) || getWorkflowTemplateByCaseType(initialCase.caseType) || getDefaultWorkflowTemplate())
    : null;

  // 動的なステップリストの生成
  // progressStatusに基づいて完了・現在・未着手を判定
  let currentIndex = template ? template.steps.findIndex(s => s.id === initialCase?.progressStatus) : -1;
  const isCompleted = initialCase?.progressStatus === 'completed';

  const handleResetData = () => {
    if (!initialCase || !template) return;
    
    if (window.confirm("【警告】\nこの案件の作業データをリセットしますか？\n（公募要項、必要資料、スケジュール等の進行データはすべて消去されますが、案件の基本情報は残ります。）\n\nよろしいですか？")) {
      updateCase(caseId, {
        extractedItems: [],
        subsidyGuidelineItems: [],
        subsidyDocumentItems: [],
        subsidyScheduleItems: [],
        subsidyDeliveryItems: [],
        validationRecord: undefined,
        progressStatus: template.steps[0]?.id as any || 'hearing',
        reviewStatus: 'pending_review'
      });
      // Component will re-render with new state
      alert("作業データをリセットしました。");
    }
  };

  const handleMockGenerate = () => {
    if (!initialCase || !template) return;
    
    if (window.confirm("【デモ用】\nモックデータを再生成し、各工程の初期状態に戻しますか？\n（現在の作業データは上書きされます。）\n\nよろしいですか？")) {
      updateCase(caseId, {
        extractedItems: undefined,
        subsidyGuidelineItems: undefined,
        subsidyDocumentItems: undefined,
        subsidyScheduleItems: undefined,
        subsidyDeliveryItems: undefined,
        validationRecord: undefined,
        progressStatus: template.steps[0]?.id as any || 'hearing',
        reviewStatus: 'pending_review'
      });
      alert("モックデータを再生成できる状態にリセットしました。各画面を開くと初期モックデータが表示されます。");
    }
  };

  const displaySteps = template ? template.steps.map((step, index) => {
    let status = 'upcoming';
    if (isCompleted) {
      status = 'completed';
    } else if (currentIndex === -1) {
      // Unknown progress status, fallback to everything is upcoming except first?
      if (index === 0) status = 'current';
    } else if (index < currentIndex) {
      status = 'completed';
    } else if (index === currentIndex) {
      status = 'current';
    }
    
    return {
      ...step,
      status,
      href: step.href ? step.href.replace('[id]', caseId) : undefined
    };
  }) : [];

  if (!initialCase) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <p className="text-slate-500">案件データを読み込み中、または見つかりませんでした...</p>
        <Link href="/cases" className="text-indigo-600 hover:underline mt-4 inline-block">一覧へ戻る</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-soft-enter">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cases" className="text-slate-500 hover:text-indigo-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">{initialCase?.title}</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/cases/${caseId}/edit`} className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg font-medium hover:bg-slate-50 text-sm inline-block transition-soft hover-lift">
            案件情報を編集
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左側: 各工程への導線 (Hub) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">業務フロー</h2>
            {isCompleted && (
              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold border border-green-200">
                全工程完了
              </span>
            )}
          </div>
          
          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm animate-soft-enter">
              この案件はすべての工程が完了しました。
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-2">
            <div className="flex flex-col gap-2">
              {displaySteps.map((step) => (
                <div 
                  key={step.id} 
                  className={`p-4 rounded-lg border status-transition ${
                    step.status === 'completed' ? 'bg-slate-50 border-slate-200' :
                    step.status === 'current' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 
                    'bg-white border-dashed border-slate-200'
                  } flex justify-between items-center transition-soft hover-lift`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step.status === 'completed' ? 'bg-slate-200 text-slate-500' :
                      step.status === 'current' ? 'bg-indigo-600 text-white' : 
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {step.status === 'completed' ? '✓' : step.order}
                    </div>
                    <div>
                      <h3 className={`font-bold flex items-center gap-2 ${step.status === 'current' ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {step.title}
                        {step.status === 'completed' && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm">完了</span>}
                        {step.status === 'current' && <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-sm">現在の工程</span>}
                        {step.status === 'upcoming' && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm border border-slate-200">未着手</span>}
                      </h3>
                      <p className="text-sm text-slate-500">{step.shortDescription || step.description}</p>
                    </div>
                  </div>
                  {step.href ? (
                    <Link href={step.href} className="px-4 py-2 bg-indigo-600 text-white rounded font-medium text-sm hover:bg-indigo-700 transition-soft hover-lift shadow-sm min-w-[72px] whitespace-nowrap text-center inline-flex items-center justify-center">
                      開く
                    </Link>
                  ) : (
                    <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-soft min-w-[72px] whitespace-nowrap text-center inline-flex items-center justify-center ${
                      step.status === 'current' ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover-lift shadow-sm' : 
                      'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}>
                      {step.status === 'upcoming' ? '未着手' : '開く'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右側: 案件詳細・ステータス */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 transition-soft hover-lift">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">確認状況</h2>
            <HumanApprovalBadge 
              status={reviewStatus} 
              onChange={handleStatusChange} 
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4 transition-soft hover-lift">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">案件情報</h2>
            
            <div>
              <div className="text-xs text-slate-500 mb-1">顧問先</div>
              <div className="font-medium text-slate-800">{initialCase?.clientName}</div>
              <div className="text-sm text-slate-600 mt-1">
                業種: {initialCase?.industry} / 従業員数: {initialCase?.employeeCount}
              </div>
              {initialCase?.clientContactPerson && (
                <div className="text-sm text-slate-600 mt-1">
                  担当者: {initialCase?.clientContactPerson}
                </div>
              )}
            </div>
            
            <div>
              <div className="text-xs text-slate-500 mb-1">案件種別</div>
              <div className="font-medium text-slate-800">{initialCase?.caseType}</div>
            </div>
            
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-slate-500 mb-1">納期</div>
                <div className="font-medium text-slate-800">{initialCase?.dueDate}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">優先度</div>
                <div className={`font-medium ${initialCase?.priority === 'high' ? 'text-red-600' : initialCase?.priority === 'medium' ? 'text-amber-600' : 'text-slate-600'}`}>
                  {initialCase?.priority === 'high' ? '高' : initialCase?.priority === 'medium' ? '中' : '低'}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">担当者</div>
              <div className="font-medium text-slate-800">{initialCase?.assignee}</div>
            </div>

            {initialCase?.memo && (
              <div>
                <div className="text-xs text-slate-500 mb-1">メモ</div>
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {initialCase.memo}
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-400">作成日: {initialCase?.createdAt}</div>
            </div>
            
            {/* 開発・デモ用リセットボタン */}
            <div className="pt-6 border-t border-slate-100 mt-6">
              <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                開発・デモ用操作
              </h3>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleMockGenerate}
                  className="text-xs text-left px-3 py-2 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded hover:bg-indigo-100 transition-colors"
                >
                  モックデータ再生成（各工程を初期化）
                </button>
                <button 
                  onClick={handleResetData}
                  className="text-xs text-left px-3 py-2 text-red-600 bg-red-50 border border-red-100 rounded hover:bg-red-100 transition-colors"
                >
                  作業データのみリセット
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
