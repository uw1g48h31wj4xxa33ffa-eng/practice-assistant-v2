"use client";

import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">設定</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-700 mb-4">基本設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">事務所情報</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none" value="テスト社会保険労務士法人" readOnly />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                  checked={settings.anonymousMode} 
                  onChange={(e) => updateSettings({ anonymousMode: e.target.checked })} 
                />
                <span className="font-medium text-slate-700">匿名管理モードを有効にする</span>
              </label>
              <p className="text-xs text-slate-500 mt-1 ml-7">画面上の顧問先名などを匿名化して表示します。</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-700 mb-4">AIプロンプト初期設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">デフォルトのAIの役割</label>
              <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none" readOnly value="あなたは日本の労働基準法に精通した社会保険労務士のアシスタントです。" />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-700 mb-4">システム設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">免責表示文</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none" readOnly value="本ツールは、社会保険労務士・税理士等の専門家が、業務整理・規程検討・情報整理を円滑に行うための補助ツールです。本ツールやAIによる出力結果は法的な助言・判断を提供するものではありません。最終的な内容の正確性・妥当性につきましては、必ず専門家自身が確認および判断を行ってください。" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">データ保存方式</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none" disabled>
                <option>localStorage（ブラウザ保存）</option>
                <option>Firestore（将来DB連携予定）</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">現在はフロントエンド完結モックのため localStorage で動作しています。</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex justify-end gap-3">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors opacity-50 cursor-not-allowed" disabled>
            保存する (デモ用)
          </button>
        </div>
      </div>
    </div>
  );
}
