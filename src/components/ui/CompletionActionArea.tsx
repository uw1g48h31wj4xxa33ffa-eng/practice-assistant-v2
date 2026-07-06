"use client";

import React from 'react';

export type CompletionActionAreaProps = {
  verifiedCount: number;
  totalCount: number;
  isAllVerified: boolean;

  progressMessage: string;
  nextStepLabel: string;
  nextStepVariant?: "indigo" | "emerald";

  primaryLabel: string;
  primaryIcon?: "arrow" | "check";

  onSaveDraft: () => void;
  onProceed: () => void;

  itemUnit?: string;
  scrollId?: string;
};

export default function CompletionActionArea({
  verifiedCount,
  totalCount,
  isAllVerified,
  progressMessage,
  nextStepLabel,
  nextStepVariant = "indigo",
  primaryLabel,
  primaryIcon = "arrow",
  onSaveDraft,
  onProceed,
  itemUnit = "項目",
  scrollId = "completion-area",
}: CompletionActionAreaProps) {
  return (
    <div id={scrollId} className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 mt-8 lg:flex-row lg:items-center lg:justify-between scroll-mt-24 order-5 md:order-none">
      <div className="space-y-2">
        <div className="text-sm font-semibold text-slate-700">
          確認状況：{verifiedCount} / {totalCount} {itemUnit}完了
        </div>
        <div className="text-sm text-slate-500">
          {progressMessage}
        </div>
        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mt-1 ${
          nextStepVariant === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
        }`}>
          {nextStepLabel}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mt-2 lg:mt-0 w-full lg:w-auto">
        <button 
          type="button"
          onClick={onSaveDraft}
          className="inline-flex h-12 w-full sm:w-auto sm:min-w-[120px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-soft hover:bg-slate-50"
        >
          一時保存
        </button>
        <button 
          type="button"
          onClick={onProceed}
          disabled={!isAllVerified}
          className="inline-flex h-12 w-full sm:w-auto sm:min-w-[240px] items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-soft hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none gap-2 whitespace-nowrap"
        >
          {primaryLabel}
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {primaryIcon === 'check' 
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            }
          </svg>
        </button>
      </div>
    </div>
  );
}
