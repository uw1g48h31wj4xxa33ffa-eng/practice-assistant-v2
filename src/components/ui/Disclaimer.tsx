import React from 'react';

export default function Disclaimer() {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 md:p-4 my-4 rounded shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-xs md:text-sm font-medium text-blue-800">利用上の注意（免責事項）</h3>
          <div className="mt-1.5 md:mt-2 text-xs md:text-sm text-blue-700">
            <p>本ツールは、社会保険労務士・税理士等の専門家が、業務整理・規程検討・情報整理を円滑に行うための補助ツールです。本ツールやAIによる出力結果は法的な助言・判断を提供するものではありません。最終的な内容の正確性・妥当性につきましては、必ず専門家自身が確認および判断を行ってください。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
