import React from 'react';

export type ReviewStatus = 'pending_review' | 'assignee_confirmed' | 'expert_confirmed' | 'delivered';

interface HumanApprovalBadgeProps {
  status: ReviewStatus;
  onChange?: (status: ReviewStatus) => void;
  readOnly?: boolean;
}

export default function HumanApprovalBadge({ status, onChange, readOnly = false }: HumanApprovalBadgeProps) {
  const statusConfig: Record<ReviewStatus, { label: string; bgColor: string; borderColor: string; textColor: string; icon: React.ReactNode }> = {
    pending_review: {
      label: 'レビュー待ち',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    assignee_confirmed: {
      label: '担当者確認済',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    expert_confirmed: {
      label: '専門家確認済',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    delivered: {
      label: '納品済',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-300',
      textColor: 'text-slate-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    }
  };

  const config = statusConfig[status];

  if (readOnly) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
        {config.icon}
        <span className="font-medium text-sm">{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-3 sm:py-2.5 rounded-xl border transition-colors ${config.bgColor} ${config.borderColor}`}>
      <div className={config.textColor}>{config.icon}</div>
      <select 
        value={status}
        onChange={(e) => onChange?.(e.target.value as ReviewStatus)}
        className={`bg-transparent font-medium text-sm sm:text-base focus:outline-none cursor-pointer pr-2 ${config.textColor}`}
      >
        {Object.entries(statusConfig).map(([key, { label }]) => (
          <option key={key} value={key} className="text-slate-800 bg-white">{label}</option>
        ))}
      </select>
    </div>
  );
}
