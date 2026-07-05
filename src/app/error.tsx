"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ログ収集ツールなどにエラーを送信する場合はここに記述
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-3xl font-bold">
            !
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          エラーが発生しました
        </h1>
        
        <p className="text-slate-600 mb-8">
          予期せぬエラーが発生しました。お手数ですが、再度お試しいただくか、トップページへお戻りください。
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            もう一度試す
          </button>
          
          <Link 
            href="/cases"
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            案件一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
