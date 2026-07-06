import React from 'react';
import { VerificationStatus } from '@/types';

export interface StatusBadgeProps {
  status: VerificationStatus | string;
  rejectedLabel?: string;
  className?: string;
}

export default function StatusBadge({ 
  status, 
  rejectedLabel = '却下済', 
  className = 'px-2 py-0.5' 
}: StatusBadgeProps) {
  const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
    unverified: { color: 'bg-rose-50 text-rose-700 border-rose-200', label: '未確認', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    verified: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: '確認済', icon: 'M5 13l4 4L19 7' },
    modified: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: '修正済・再確認待ち', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    rejected: { color: 'bg-slate-100 text-slate-500 border-slate-300', label: rejectedLabel, icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
  };

  const conf = statusConfig[status as string] || statusConfig.unverified;

  return (
    <span className={`flex items-center gap-1 text-xs font-bold rounded border transition-colors duration-300 whitespace-nowrap ${conf.color} ${className}`}>
      <svg className="w-3.5 h-3.5 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={conf.icon} />
      </svg>
      {conf.label}
    </span>
  );
}
