"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';

export default function ActionPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: caseId } = use(params);
  const { getCaseById, updateCase } = useCases();
  
  const currentCase = getCaseById(caseId);

  const handleNextStep = () => {
    if (!currentCase) return;
    updateCase(caseId, { progressStatus: 'ai_evidence' });
    router.push(`/cases/${caseId}/ai-evidence`);
  };

  if (!currentCase) {
    return <div className="p-8 text-center text-slate-500">案件が見つかりません。</div>;
  }

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
          <p className="text-sm text-slate-500 mt-1">{currentCase.title} - 案件ID: {caseId}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center text-slate-500 py-20">
        （ダミー画面）対応方針のUIがここに表示されます。
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
