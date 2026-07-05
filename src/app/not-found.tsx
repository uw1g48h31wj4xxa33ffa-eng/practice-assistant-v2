"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl font-bold">
            !
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          ページが見つかりません
        </h1>
        
        <p className="text-slate-600 mb-8">
          お探しのページは削除されたか、URLが変更された可能性があります。
        </p>

        <Link 
          href="/cases"
          className="inline-flex items-center justify-center w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          案件一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
