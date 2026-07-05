"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import { getWorkflowTemplateById, getWorkflowTemplateByCaseType, getDefaultWorkflowTemplate } from '@/config/workflowTemplates';
import { CaseProgressStatus } from '@/types';

export default function WorkflowPlaceholderPage({ params }: { params: Promise<{ id: string, stepId: string }> }) {
  const router = useRouter();
  const { id: caseId, stepId } = use(params);
  const { getCaseById, updateCase } = useCases();
  
  const initialCase = getCaseById(caseId);
  const template = initialCase 
    ? (getWorkflowTemplateById(initialCase.templateId) || getWorkflowTemplateByCaseType(initialCase.caseType) || getDefaultWorkflowTemplate())
    : null;

  const stepIndex = template ? template.steps.findIndex(s => s.id === stepId) : -1;
  const step = stepIndex !== -1 && template ? template.steps[stepIndex] : null;
  const nextStep = template && stepIndex !== -1 && stepIndex < template.steps.length - 1 ? template.steps[stepIndex + 1] : null;

  const handleComplete = () => {
    if (!initialCase) return;
    const nextStatus = nextStep ? nextStep.id : 'completed';
    updateCase(caseId, { progressStatus: nextStatus as CaseProgressStatus });
    router.push(`/cases/${caseId}`);
  };

  if (!initialCase || !step) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center animate-soft-enter">
        <p className="text-slate-500">案件データ、またはステップ情報が見つかりませんでした。</p>
        <Link href="/cases" className="text-indigo-600 hover:underline mt-4 inline-block hover-lift transition-soft">一覧へ戻る</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-soft-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/cases/${caseId}`} className="text-slate-500 hover:text-indigo-600 transition-soft hover-lift">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">{step.title}</h1>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center space-y-6 transition-soft hover-lift">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">{initialCase.title}</h2>
          <p className="text-slate-500 mb-4">テンプレート: {template?.name}</p>
          <div className="bg-slate-50 rounded-lg p-4 text-left border border-slate-100 max-w-xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-2">ステップ: {step.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 text-left max-w-lg mx-auto">
          <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            現在は準備中です
          </h3>
          <p className="text-sm text-indigo-800 mb-4">
            この画面は将来的に以下の機能を実装する予定です。
          </p>
          <ul className="text-sm text-indigo-800 list-disc list-inside space-y-1 ml-2">
            <li>AIによる自動下書き生成・情報抽出</li>
            <li>外部API（e-Gov、補助金ポータル等）との連携</li>
            <li>ファイルのアップロード・OCR解析</li>
            <li>担当者および専門家によるレビュー機能</li>
          </ul>
        </div>

        <div className="pt-8 flex justify-center gap-4 border-t border-slate-100">
          <Link href={`/cases/${caseId}`} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-soft hover-lift shadow-sm">
            案件詳細へ戻る
          </Link>
          <button 
            onClick={handleComplete}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-soft hover-lift shadow-sm flex items-center gap-2"
          >
            {nextStep ? (
              <>
                完了して次工程へ進む
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              <>
                すべての工程を完了する
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
