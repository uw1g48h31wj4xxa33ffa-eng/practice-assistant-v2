import React, { useState } from 'react';
import { SourceDocument } from '@/types';
import Button from '@/components/ui/Button';

type SourceType = SourceDocument['sourceType'];

interface SourceInputPanelProps {
  sourceDocuments: SourceDocument[];
  onAddDocument: (doc: SourceDocument) => void;
  onRemoveDocument: (id: string) => void;
  onRemoveAllDocuments?: () => void;
  onAnalyze?: () => void;
  analyzeStatus?: 'idle' | 'analyzing' | 'completed' | 'error';
  hasHumanVerifiedItems?: boolean;
}

export default function SourceInputPanel({
  sourceDocuments,
  onAddDocument,
  onRemoveDocument,
  onRemoveAllDocuments,
  onAnalyze,
  analyzeStatus = 'idle',
  hasHumanVerifiedItems = false
}: SourceInputPanelProps) {
  const [inputType, setInputType] = useState<SourceType>('pdf');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (!title.trim()) {
      alert('資料タイトルを入力してください');
      return;
    }
    
    if (inputType === 'url' && !url.trim()) {
      alert('URLを入力してください');
      return;
    }
    
    if (inputType === 'text' && !text.trim()) {
      alert('テキストを入力してください');
      return;
    }

    const newDoc: SourceDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceType: inputType,
      title: title.trim(),
      url: inputType === 'url' ? url.trim() : undefined,
      text: inputType === 'text' ? text.trim() : undefined,
      fileName: inputType === 'pdf' ? 'dummy.pdf' : undefined, // ダミー
      uploadedAt: new Date().toISOString()
    };

    onAddDocument(newDoc);
    
    // リセット
    setTitle('');
    setUrl('');
    setText('');
  };


  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6 order-2 md:order-none">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          実資料入力
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          参照する資料（PDF、URL、テキスト）を追加してください。登録した資料からAIが事実関係や要件を整理します。
        </p>

        {/* 入力フォーム */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">入力方法</label>
            <div className="flex flex-wrap gap-2">
              <button 
                type="button"
                onClick={() => setInputType('pdf')}
                className={`px-4 py-2 text-sm font-medium rounded-md border ${inputType === 'pdf' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              >
                PDFアップロード
              </button>
              <button 
                type="button"
                onClick={() => setInputType('url')}
                className={`px-4 py-2 text-sm font-medium rounded-md border ${inputType === 'url' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              >
                URL入力
              </button>
              <button 
                type="button"
                onClick={() => setInputType('text')}
                className={`px-4 py-2 text-sm font-medium rounded-md border ${inputType === 'text' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              >
                テキスト入力
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">資料タイトル <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="例：IT導入補助金2024 公募要項"
            />
          </div>

          {inputType === 'pdf' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PDFファイル</label>
              <div className="border-2 border-dashed border-slate-300 rounded-md p-6 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-1 text-sm text-slate-600">クリックまたはドラッグ＆ドロップでPDFを追加</p>
                <p className="mt-1 text-xs text-slate-500">※デモ環境のためファイルはアップロードされません</p>
              </div>
            </div>
          )}

          {inputType === 'url' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">参照URL <span className="text-red-500">*</span></label>
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="https://..."
              />
            </div>
          )}

          {inputType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">テキスト内容 <span className="text-red-500">*</span></label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="メモやテキストを直接入力・貼り付け"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleAdd} variant="secondary">
              資料を追加
            </Button>
          </div>
        </div>
      </div>

      {/* 資料リスト */}
      <div className="p-6 bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-sm font-bold text-slate-700">登録済み資料（{sourceDocuments.length}件）</h3>
          {sourceDocuments.length > 0 && onRemoveAllDocuments && (
            <button
              onClick={() => {
                if (window.confirm('登録済み資料をすべて削除します。よろしいですか？')) {
                  onRemoveAllDocuments();
                }
              }}
              className="w-full sm:w-auto text-xs text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-red-200 transition-colors shadow-sm font-medium flex items-center justify-center gap-1 min-h-[44px] sm:min-h-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              登録資料をすべて削除
            </button>
          )}
        </div>
        {sourceDocuments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">資料はまだ登録されていません</p>
        ) : (
          <ul className="space-y-3">
            {sourceDocuments.map(doc => (
              <li key={doc.id} className="bg-white border border-slate-200 rounded-md p-3 flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase shrink-0">{doc.sourceType}</span>
                    <h4 className="font-bold text-sm text-slate-800 break-words">{doc.title}</h4>
                  </div>
                  {doc.url && <p className="text-xs text-indigo-600 break-all">{doc.url}</p>}
                  {doc.fileName && <p className="text-xs text-slate-500 break-words">ファイル: {doc.fileName}</p>}
                  {doc.text && <p className="text-xs text-slate-500 break-words line-clamp-3">{doc.text}</p>}
                  <p className="text-[10px] text-slate-400 mt-1">追加日時: {new Date(doc.uploadedAt).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm('この資料を削除してもよろしいですか？')) {
                      onRemoveDocument(doc.id);
                    }
                  }}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] -mr-1 mt-[-4px]"
                  aria-label="削除"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col items-center gap-2">
          {hasHumanVerifiedItems ? (
            <p className="text-sm text-amber-600 font-medium">既存の抽出結果があります。安全のため上書きしません</p>
          ) : sourceDocuments.length === 0 ? (
            <p className="text-sm text-slate-500">資料を登録するとAIで整理できます</p>
          ) : analyzeStatus === 'completed' ? (
            <p className="text-sm text-green-600 font-medium">AI整理結果を確認してください</p>
          ) : analyzeStatus === 'analyzing' ? (
            <p className="text-sm text-indigo-600 font-medium">登録資料を整理しています...</p>
          ) : (
            <p className="text-sm text-slate-500">登録済み資料 {sourceDocuments.length}件をAIで整理できます</p>
          )}

          <Button 
            onClick={onAnalyze} 
            disabled={sourceDocuments.length === 0 || hasHumanVerifiedItems || analyzeStatus === 'analyzing'}
            variant="primary" 
            className={`w-full sm:w-auto shadow-md min-h-[44px] ${analyzeStatus === 'analyzing' ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {analyzeStatus === 'analyzing' ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                整理中...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                登録した資料をAIで整理する
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
