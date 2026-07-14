"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import HumanApprovalBadge, { ReviewStatus } from '@/components/ui/HumanApprovalBadge';
import Chip from '@/components/ui/Chip';
import { getWorkflowTemplateById, getWorkflowTemplateByCaseType, getDefaultWorkflowTemplate } from '@/config/workflowTemplates';
import { CaseProgressStatus } from '@/types';

// Phase 0AのProfile解決へ接続するまでの暫定判定
// 税務相談・その他の誤適用防止
const MODERN_LABOR_RULE_CASE_TYPES = new Set<string>([
  '就業規則改訂',
  '賃金規程',
  '育児介護休業規程',
  '規程改訂',
]);

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
  const currentIndex = template ? template.steps.findIndex(s => s.id === initialCase?.progressStatus) : -1;
  const isCompleted = initialCase?.progressStatus === 'completed';

  const handleResetData = () => {
    if (!initialCase || !template) return;
    
    if (window.confirm("【警告】\nこの案件の作業データをリセットしますか？\n（関連資料、スケジュール、論点等の進行データはすべて消去されますが、案件の基本情報は残ります。）\n\nよろしいですか？")) {
      updateCase(caseId, {
        extractedItems: [],
        subsidyGuidelineItems: [],
        subsidyDocumentItems: [],
        requiredDocuments: [],
        subsidyScheduleItems: [],
        subsidyDeliveryItems: [],
        sourceDocuments: [],
        evidenceItems: [],
        issueItems: [],
        riskItems: [],
        actionPlanItems: [],
        validationRecord: undefined,
        progressStatus: template.steps[0]?.id as CaseProgressStatus || 'hearing',
        reviewStatus: 'pending_review'
      });
      // Component will re-render with new state
      alert("作業データをリセットしました。");
      window.location.reload();
    }
  };

  const handleMockGenerate = () => {
    if (!initialCase || !template) return;
    
    if (window.confirm("【デモ用】\nモックデータを再生成し、各工程の初期状態に戻しますか？\n（現在の作業データは上書きされます。）\n\nよろしいですか？")) {
      updateCase(caseId, {
        extractedItems: [],
        subsidyGuidelineItems: [],
        subsidyDocumentItems: [],
        requiredDocuments: [],
        subsidyScheduleItems: [],
        subsidyDeliveryItems: [],
        sourceDocuments: [],
        evidenceItems: [],
        issueItems: [],
        riskItems: [],
        actionPlanItems: [],
        validationRecord: undefined,
        progressStatus: template.steps[0]?.id as CaseProgressStatus || 'hearing',
        reviewStatus: 'pending_review'
      });
      alert("モックデータを再生成できる状態にリセットしました。各画面を開くと初期モックデータが表示されます。");
      window.location.reload();
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

  const isModernLaborRulesCase =
    template?.id === 'labor_rules_v1' &&
    MODERN_LABOR_RULE_CASE_TYPES.has(initialCase.caseType);

  const usesModernWorkflowLayout =
    template?.id === 'subsidy_v1' ||
    template?.id === 'labor_consulting_v1' ||
    isModernLaborRulesCase;

  let completedCount = 0;
  let currentCount = 0;
  let remainingCount = 0;
  let progressPercent = 0;
  
  if (template) {
    const totalSteps = template.steps.length;
    if (initialCase.progressStatus === 'completed') {
      completedCount = totalSteps;
      currentCount = 0;
      remainingCount = 0;
      progressPercent = 100;
    } else {
      if (currentIndex >= 0) {
        completedCount = currentIndex;
        currentCount = 1;
        remainingCount = Math.max(0, totalSteps - completedCount - currentCount);
        progressPercent = Math.round((completedCount / totalSteps) * 100);
      } else {
        completedCount = 0;
        currentCount = 1;
        remainingCount = Math.max(0, totalSteps - 1);
        progressPercent = 0;
      }
    }
  }

  let aiStatus = { label: '待機中', desc: 'AI処理可能な工程ではありません', color: 'slate' };
  
  if (template?.id === 'labor_consulting_v1') {
    if (initialCase.progressStatus === 'issue_analysis') {
      if (initialCase.issueItems && initialCase.issueItems.length > 0) {
        aiStatus = { label: 'AI整理完了', desc: '論点候補を抽出しました', color: 'indigo' };
      } else {
        aiStatus = { label: '未着手', desc: '論点のAI整理を実行できます', color: 'slate' };
      }
    } else if (initialCase.progressStatus === 'document_prep') {
      if (initialCase.requiredDocuments && initialCase.requiredDocuments.length > 0) {
        aiStatus = { label: 'AI整理完了', desc: '関連資料リストを整理しました', color: 'indigo' };
      } else {
        aiStatus = { label: '未着手', desc: '関連資料リストをAI生成できます', color: 'slate' };
      }
    } else if (initialCase.progressStatus === 'risk_analysis') {
      if (initialCase.riskItems && initialCase.riskItems.length > 0) {
        aiStatus = { label: 'AI整理完了', desc: '労務リスクを抽出しました', color: 'indigo' };
      } else {
        aiStatus = { label: '未着手', desc: '労務リスクのAI整理を実行できます', color: 'slate' };
      }
    } else if (initialCase.progressStatus === 'action_plan') {
      if (initialCase.actionPlanItems && initialCase.actionPlanItems.length > 0) {
        aiStatus = { label: 'AI整理完了', desc: '対応方針を策定しました', color: 'indigo' };
      } else {
        aiStatus = { label: '未着手', desc: '対応方針のAI策定を実行できます', color: 'slate' };
      }
    } else if (initialCase.progressStatus === 'ai_evidence') {
      aiStatus = { label: '検証待ち', desc: 'AIによる検証・エビデンス確認が可能です', color: 'indigo' };
    } else if (initialCase.progressStatus === 'completed') {
      aiStatus = { label: '処理完了', desc: 'すべてのAI処理が完了しました', color: 'green' };
    } else {
      aiStatus = { label: '待機中', desc: '次のAIタスクを待機しています', color: 'slate' };
    }
  } else {
    // 補助金・規程用の既存ロジック
    if (initialCase.progressStatus === 'guideline_review') {
      if (initialCase.subsidyGuidelineItems && initialCase.subsidyGuidelineItems.length > 0) {
        aiStatus = { label: 'AI抽出完了', desc: '公募要項から情報を抽出しました', color: 'indigo' };
      } else {
        aiStatus = { label: '未着手', desc: '公募要項の解析を実行できます', color: 'slate' };
      }
    } else if (initialCase.progressStatus === 'document_prep') {
      if (initialCase.requiredDocuments && initialCase.requiredDocuments.length > 0) {
        aiStatus = { label: 'AI整理完了', desc: '必要資料リストを整理しました', color: 'indigo' };
      } else {
        aiStatus = { label: '未着手', desc: '必要資料リストを生成できます', color: 'slate' };
      }
    } else if (initialCase.progressStatus === 'completed') {
      aiStatus = { label: '処理完了', desc: 'すべてのAI処理が完了しました', color: 'green' };
    } else if (initialCase.progressStatus === 'ai_review' || initialCase.progressStatus === 'ai_evidence') {
      aiStatus = { label: '検証待ち', desc: 'AIによる検証・エビデンス確認が可能です', color: 'indigo' };
    } else {
      aiStatus = { label: '待機中', desc: '次のAIタスクを待機しています', color: 'slate' };
    }
  }

  const nextStep = template && currentIndex >= 0 && currentIndex + 1 < template.steps.length 
    ? template.steps[currentIndex + 1] 
    : null;

  const renderLegacyLayout = () => (
    <div className="max-w-5xl mx-auto space-y-6 animate-soft-enter">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 md:gap-4">
          <Link href="/cases" className="text-slate-500 hover:text-indigo-600 transition-colors mt-1 sm:mt-0 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 break-all">{initialCase?.title}</h1>
        </div>
        <div className="flex w-full sm:w-auto">
          <Link href={`/cases/${caseId}/edit`} className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg font-medium hover:bg-slate-50 text-sm inline-block text-center transition-soft hover-lift">
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
              <Chip label="全工程完了" color="green" variant="outline" size="md" rounded="full" />
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
                  } flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-soft hover-lift`}
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
                      <h3 className={`font-bold flex flex-wrap items-center gap-1.5 md:gap-2 ${step.status === 'current' ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {step.title}
                        {step.status === 'completed' && <Chip label="完了" color="slate" variant="solid" size="xs" />}
                        {step.status === 'current' && <Chip label="現在の工程" color="indigo" variant="outline" size="xs" />}
                        {step.status === 'upcoming' && <Chip label="未着手" color="slate" variant="outline" size="xs" />}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{step.shortDescription || step.description}</p>
                    </div>
                  </div>
                  {step.href ? (
                    <Link href={step.href} className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded font-medium text-sm hover:bg-indigo-700 transition-soft hover-lift shadow-sm min-w-[72px] whitespace-nowrap text-center inline-flex items-center justify-center">
                      開く
                    </Link>
                  ) : (
                    <button className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-soft min-w-[72px] whitespace-nowrap text-center inline-flex items-center justify-center ${
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
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 transition-soft hover-lift flex flex-col items-center md:items-start">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 md:mb-4 text-center md:text-left w-full">確認状況</h2>
            <div className="flex justify-center md:justify-start w-full">
              <HumanApprovalBadge 
                status={reviewStatus} 
                onChange={handleStatusChange} 
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 space-y-4 md:space-y-5 transition-soft hover-lift">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">納期</div>
                <div className="font-medium text-slate-800">{initialCase?.dueDate}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">優先度</div>
                <div>
                  <Chip 
                    label={initialCase?.priority === 'high' ? '高' : initialCase?.priority === 'medium' ? '中' : '低'}
                    color={initialCase?.priority === 'high' ? 'red' : initialCase?.priority === 'medium' ? 'amber' : 'slate'}
                    variant="subtle"
                  />
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
                <div className="text-sm text-slate-700 bg-slate-50 px-4 py-3 md:p-3 rounded-lg border border-slate-100">
                  {initialCase.memo}
                </div>
              </div>
            )}
            
            <div className="pt-3 md:pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-400 text-center md:text-left">作成日: {initialCase?.createdAt}</div>
            </div>
          </div>

          {/* 開発・デモ用リセットボタン */}
          <div className="mt-8 pt-4">
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
  );

  const renderSubsidyLayout = () => {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-soft-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link href="/cases" className="text-slate-500 hover:text-indigo-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 break-all">{initialCase.title}</h1>
              <Chip label={isCompleted ? '完了' : '進行中'} color={isCompleted ? 'green' : 'indigo'} variant="solid" />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 sm:pl-9">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {initialCase.clientName}
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                納期: {initialCase.dueDate}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-slate-400">優先度:</span>
                <span className={`font-bold ${initialCase.priority === 'high' ? 'text-red-600' : initialCase.priority === 'medium' ? 'text-amber-600' : 'text-slate-600'}`}>
                  {initialCase.priority === 'high' ? '高' : initialCase.priority === 'medium' ? '中' : '低'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <Link href={`/cases/${caseId}/edit`} className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg font-medium hover:bg-slate-50 text-sm inline-block text-center transition-soft hover-lift shadow-sm">
              案件情報を編集
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左側: 業務フロー (Timeline) */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">業務フロー</h2>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 relative">
              <div className="absolute top-10 bottom-10 left-[39px] w-0.5 bg-slate-100 z-0 hidden sm:block"></div>
              
              <div className="flex flex-col gap-6 sm:gap-8 relative z-10">
                {displaySteps.map((step) => (
                  <div key={step.id} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm z-10 hidden sm:flex ${
                      step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'current' ? 'bg-indigo-600 text-white shadow-md' : 
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {step.status === 'completed' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.order
                      )}
                    </div>
                    <div className={`flex-1 w-full p-4 rounded-xl border transition-soft ${
                      step.status === 'current' ? 'bg-indigo-50 border-indigo-100 shadow-sm ring-1 ring-indigo-50' : 
                      'bg-white border-slate-100'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="sm:hidden text-xs font-bold text-slate-400">{step.order}.</span>
                            <h3 className={`font-bold text-base md:text-lg ${step.status === 'current' ? 'text-indigo-900' : 'text-slate-700'}`}>
                              {step.title}
                            </h3>
                            {step.status === 'completed' && <Chip label="完了" color="green" variant="subtle" size="xs" />}
                            {step.status === 'current' && <Chip label="進行中" color="indigo" variant="subtle" size="xs" />}
                            {step.status === 'upcoming' && <Chip label="未着手" color="slate" variant="subtle" size="xs" />}
                          </div>
                          {step.status === 'current' && (
                            <div className="mt-3 flex items-center gap-3">
                              <div className="text-xs font-bold text-indigo-400 w-16">処理状況</div>
                              <div className="flex-1 h-1.5 bg-indigo-200/50 rounded-full overflow-hidden max-w-[120px]">
                                <div className="h-full bg-indigo-500 rounded-full w-1/2 animate-pulse"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        {step.href ? (
                          <Link href={step.href} className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-sm transition-soft min-w-[80px] text-center inline-flex items-center justify-center ${
                            step.status === 'current' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 
                            'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                          }`}>
                            開く
                          </Link>
                        ) : (
                          <button className="w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-sm transition-soft min-w-[80px] text-center inline-flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed">
                            開く
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右側: 進捗・AI・次工程 */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 transition-soft hover-lift flex flex-col items-center md:items-start">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 md:mb-4 text-center md:text-left w-full">確認状況</h2>
              <div className="flex justify-center md:justify-start w-full">
                <HumanApprovalBadge 
                  status={reviewStatus} 
                  onChange={handleStatusChange} 
                />
              </div>
            </div>

            {/* 全体進捗 ドーナツグラフ */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col items-center">
              <h3 className="text-sm font-bold text-slate-800 mb-6 self-start">全体進捗</h3>
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
                  {!isCompleted && remainingCount > 0 && (
                    <span className="text-[10px] text-slate-500 mt-1 font-bold">あと{remainingCount}工程</span>
                  )}
                </div>
              </div>
              
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span>
                    <span className="text-slate-600 font-medium">完了</span>
                  </div>
                  <span className="font-bold text-slate-800">{completedCount}件</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm"></span>
                    <span className="text-slate-600 font-medium">進行中</span>
                  </div>
                  <span className="font-bold text-slate-800">{currentCount}件</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                    <span className="text-slate-600 font-medium">未着手</span>
                  </div>
                  <span className="font-bold text-slate-800">{remainingCount}件</span>
                </div>
              </div>
            </div>

            {/* AI処理状況 */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">AI処理状況</h3>
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className={`mt-1 flex-shrink-0 w-3 h-3 rounded-full ${aiStatus.color === 'indigo' ? 'bg-indigo-600 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]' : aiStatus.color === 'green' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <div>
                  <div className={`font-bold text-sm ${aiStatus.color === 'indigo' ? 'text-indigo-700' : aiStatus.color === 'green' ? 'text-green-700' : 'text-slate-600'}`}>
                    {aiStatus.label}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{aiStatus.desc}</p>
                </div>
              </div>
            </div>

            {/* 次に進む工程 */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">次に進む工程</h3>
              {initialCase.progressStatus === 'completed' ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-bold text-green-800">すべての工程が完了しました</span>
                </div>
              ) : nextStep ? (
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white text-indigo-600 flex items-center justify-center border border-slate-200 shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{nextStep.title}</div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{nextStep.shortDescription || nextStep.description}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white text-indigo-600 flex items-center justify-center border border-slate-200 shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">最終処理</div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">納品と案件の完了手続きを行います。</p>
                  </div>
                </div>
              )}
            </div>

            {/* デモ用 */}
            <div className="mt-8 pt-4 border-t border-slate-100">
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
                  className="text-xs text-left px-3 py-2 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded hover:bg-indigo-100 transition-colors font-medium"
                >
                  モックデータ再生成（各工程を初期化）
                </button>
                <button 
                  onClick={handleResetData}
                  className="text-xs text-left px-3 py-2 text-red-600 bg-red-50 border border-red-100 rounded hover:bg-red-100 transition-colors font-medium"
                >
                  作業データのみリセット
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return usesModernWorkflowLayout ? renderSubsidyLayout() : renderLegacyLayout();
}
