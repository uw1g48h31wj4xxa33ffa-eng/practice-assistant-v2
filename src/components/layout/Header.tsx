import React from 'react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 shrink-0 justify-between">
      <div className="flex items-center text-slate-800 font-medium">
        {/* You can inject breadcrumbs or dynamic title here later */}
        <span>業務検討補助ワークスペース</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          オフラインモックモード
        </span>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
          管
        </div>
      </div>
    </header>
  );
}
