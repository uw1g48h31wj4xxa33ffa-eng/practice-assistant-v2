"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import TaskSelector from '@/components/features/ai/TaskSelector';
import TaskGuidance from '@/components/features/ai/TaskGuidance';
import { AITaskTemplate, Case } from '@/types';

export default function RuleDesignPage() {
  const params = useParams();
  const caseId = params.id as string;
  const { getCaseById } = useCases();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [selectedTask, setSelectedTask] = useState<AITaskTemplate | null>(null);

  useEffect(() => {
    const existingCase = getCaseById(caseId);
    if (existingCase) {
      setCaseData(existingCase);
    }
  }, [caseId, getCaseById]);

  // 集計
  const extracted = caseData?.extractedItems || [];
  const verifiedCount = extracted.filter(i => i.status === 'verified').length;
  const modifiedCount = extracted.filter(i => i.status === 'modified').length;
  const rejectedCount = extracted.filter(i => i.status === 'rejected').length;

  const factCount = extracted.filter(i => i.category === '事実関係' && i.status !== 'rejected').length;
  const issueCount = extracted.filter(i => i.category === '課題・論点' && i.status !== 'rejected').length;
  const riskCount = extracted.filter(i => i.category === 'リスク' && i.status !== 'rejected').length;
  const missingCount = extracted.filter(i => i.category === '不足情報' && i.status !== 'rejected').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/cases/${caseId}`} className="text-slate-500 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">規程設計・ドラフト作成</h1>
          <p className="text-sm text-slate-500 mt-1">{caseData?.title || '読込中...'} - 案件ID: {caseId}</p>
        </div>
      </div>

      {extracted.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-700 block mb-1">前工程からの引き継ぎデータ</span>
              <span className="text-xs text-slate-500">ヒアリング結果 {extracted.length} 件確認完了</span>
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">確認済 {verifiedCount}件</span>
              <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">修正済 {modifiedCount}件</span>
              <span className="text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">却下 {rejectedCount}件</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 pt-4 border-t border-slate-200 text-sm">
            <span className="text-slate-600 font-medium">カテゴリ別（AI送信対象）:</span>
            <div className="flex gap-4 text-slate-700">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>事実関係: <strong>{factCount}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>論点: <strong>{issueCount}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>リスク: <strong>{riskCount}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>不足情報: <strong>{missingCount}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <TaskSelector 
          onSelect={(task) => setSelectedTask(task)} 
          selectedTaskId={selectedTask?.id} 
        />
        
        {selectedTask && caseData && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <TaskGuidance task={selectedTask} caseData={caseData} />
          </div>
        )}
      </div>
      
      <div className="flex justify-end pt-4">
        <Link href={`/cases/${caseId}`} className="px-6 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg font-medium hover:bg-slate-50 transition-colors">
          詳細画面へ戻る
        </Link>
      </div>
    </div>
  );
}
