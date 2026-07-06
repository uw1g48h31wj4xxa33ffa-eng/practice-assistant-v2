import React from 'react';

export type ChipProps = {
  label: string;
  color?: 'slate' | 'indigo' | 'rose' | 'amber' | 'emerald' | 'green' | 'red';
  size?: 'xs' | 'sm' | 'md';
  variant?: 'solid' | 'outline' | 'subtle';
  rounded?: 'normal' | 'full';
  className?: string;
};

export default function Chip({
  label,
  color = 'slate',
  size = 'sm',
  variant = 'solid',
  rounded = 'normal',
  className = ''
}: ChipProps) {
  const baseClasses = 'font-bold whitespace-nowrap inline-flex items-center justify-center';
  
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
  };

  const roundedClasses = {
    normal: 'rounded',
    full: 'rounded-full',
  };

  // 既存コードを再現するためのカラースキーマ
  const colorVariants = {
    solid: {
      slate: 'bg-slate-200 text-slate-600 border border-transparent', // 案件詳細の「完了」
      indigo: 'bg-indigo-600 text-white border border-transparent',
      rose: 'bg-rose-600 text-white border border-transparent',
      red: 'bg-red-600 text-white border border-transparent',
      amber: 'bg-amber-600 text-white border border-transparent',
      emerald: 'bg-emerald-600 text-white border border-transparent',
      green: 'bg-green-600 text-white border border-transparent',
    },
    outline: {
      slate: 'bg-slate-100 text-slate-500 border border-slate-200', // ダッシュボードの案件種別、未着手
      indigo: 'bg-indigo-100 text-indigo-700 border border-indigo-200', // 現在の工程
      rose: 'bg-white text-rose-600 border border-rose-200',
      red: 'bg-white text-red-600 border border-red-200',
      amber: 'bg-white text-amber-600 border border-amber-200',
      emerald: 'bg-white text-emerald-600 border border-emerald-200',
      green: 'bg-green-100 text-green-700 border border-green-200', // 全工程完了
    },
    subtle: {
      // ダッシュボード等の薄い背景色バッジ再現用
      slate: 'bg-slate-100 text-slate-500 border border-transparent', // 案件一覧の顧問先
      indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-100', // ダッシュボードの顧問先
      rose: 'bg-rose-50 text-rose-600 border border-rose-100',
      red: 'bg-red-50 text-red-600 border border-red-100', // 優先度 高
      amber: 'bg-amber-50 text-amber-600 border border-amber-100',
      emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      green: 'bg-green-50 text-green-700 border border-green-100',
    }
  };

  const selectedSize = sizeClasses[size] || sizeClasses.sm;
  const selectedRounded = roundedClasses[rounded] || roundedClasses.normal;
  const selectedColor = colorVariants[variant]?.[color] || colorVariants.solid.slate;

  return (
    <span className={`${baseClasses} ${selectedSize} ${selectedRounded} ${selectedColor} ${className}`}>
      {label}
    </span>
  );
}
