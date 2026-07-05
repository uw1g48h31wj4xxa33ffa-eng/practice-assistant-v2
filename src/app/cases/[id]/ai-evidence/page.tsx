"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import { EvidenceItem, AIValidationRecord } from '@/types';

export default function AIEvidencePage() {
  const params = useParams();
  const caseId = params.id as string;
  const { getCaseById, updateCase, updateCaseStatus } = useCases();

  const [isLoaded, setIsLoaded] = useState(false);
  const [caseData, setCaseData] = useState<ReturnType<typeof getCaseById>>(undefined);

  // Editable state
  const [promptText, setPromptText] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [staffComment, setStaffComment] = useState('');
  const [expertComment, setExpertComment] = useState('');
  const [currentReviewStatus, setCurrentReviewStatus] = useState<string>('pending_review');

  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [newEvidence, setNewEvidence] = useState<Partial<EvidenceItem>>({
    sourceType: '官公庁',
    title: '',
    url: '',
    summary: '',
    isVerifiedByHuman: false
  });

  const prevCaseIdRef = useRef<string | null>(null);

  useEffect(() => {
    const c = getCaseById(caseId);
    setCaseData(c);

    // Initial load for this case
    if (c && prevCaseIdRef.current !== caseId) {
      prevCaseIdRef.current = caseId;
      setCurrentReviewStatus(c.reviewStatus);

      // Generate default contents
      const validItems = c.extractedItems?.filter(i => i.status !== 'rejected') || [];
      let defaultPrompt = `案件名: ${c.title}\n顧問先: ${c.clientName}\n案件種別: ${c.caseType}\n\n`;
      if (validItems.length > 0) {
        defaultPrompt += `【抽出情報】\n`;
        validItems.forEach(i => {
          defaultPrompt += `- [${i.category}] ${i.content}\n`;
        });
      }
      defaultPrompt += `\n上記を踏まえ、法的リスクと必要な規程案を提示してください。`;
      
      const defaultAiOutput = `（※これは自動生成されたモック回答です）\n\n本件「${c.title}」に関する初期検討結果：\n\n1. 最新の法改正情報の確認が推奨されます。\n2. 就業規則への記載事項について、実態との乖離がないかヒアリング内容と照合してください。\n\n※実際の業務では、ここにAIツールからの出力結果が反映されます。`;

      if (c.validationRecord) {
        setPromptText(c.validationRecord.promptText || defaultPrompt);
        setAiOutput(c.validationRecord.aiOutput || defaultAiOutput);
        setEvidenceItems(c.validationRecord.evidenceItems);
        setStaffComment(c.validationRecord.staffComment);
        setExpertComment(c.validationRecord.expertComment);
      } else {
        // Empty state for new cases -> use defaults instead of empty strings
        setPromptText(defaultPrompt);
        setAiOutput(defaultAiOutput);
        setEvidenceItems([]);
        setStaffComment('');
        setExpertComment('');
      }
    }
    setIsLoaded(true);
  }, [caseId, getCaseById]);

  const saveRecord = useCallback(() => {
    if (!caseId) return;
    const updatedRecord: AIValidationRecord = {
      promptText,
      aiOutput,
      evidenceItems,
      staffComment,
      expertComment
    };
    updateCase(caseId, { validationRecord: updatedRecord });
  }, [caseId, promptText, aiOutput, evidenceItems, staffComment, expertComment, updateCase]);

  // Save automatically when items change
  useEffect(() => {
    if (isLoaded && prevCaseIdRef.current === caseId) {
      const timeout = setTimeout(() => {
        saveRecord();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [promptText, aiOutput, evidenceItems, staffComment, expertComment, isLoaded, caseId, saveRecord]);

  const handleAddEvidence = () => {
    if (!newEvidence.title || !newEvidence.summary) return;

    const item: EvidenceItem = {
      id: `evi_${Date.now()}`,
      sourceType: newEvidence.sourceType as any,
      title: newEvidence.title,
      url: newEvidence.url || '',
      checkedAt: new Date().toISOString().split('T')[0],
      summary: newEvidence.summary,
      isVerifiedByHuman: newEvidence.isVerifiedByHuman || false
    };

    setEvidenceItems(prev => [...prev, item]);
    setShowAddEvidence(false);
    setNewEvidence({ sourceType: '官公庁', title: '', url: '', summary: '', isVerifiedByHuman: false });
  };

  const toggleEvidenceVerification = (id: string) => {
    setEvidenceItems(prev => prev.map(item => 
      item.id === id ? { ...item, isVerifiedByHuman: !item.isVerifiedByHuman } : item
    ));
  };

  const removeEvidence = (id: string) => {
    setEvidenceItems(prev => prev.filter(item => item.id !== id));
  };

  const handleStatusChange = (status: string) => {
    // 専門家確認前は納品反映可(delivered)にできない制御
    if (status === 'delivered' && currentReviewStatus !== 'expert_confirmed') {
      alert('納品反映可に変更するには、まず専門家確認済にする必要があります。');
      return;
    }
    setCurrentReviewStatus(status);
    updateCaseStatus(caseId, status as any);
  };

  if (!isLoaded || !caseData) {
    return <div className="p-8 text-center text-slate-500">読み込み中...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 案件情報サマリー */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <Link href={`/cases/${caseId}`} className="text-slate-500 hover:text-indigo-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">AI検証・エビデンス</h1>
          </div>
          <div className="text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-slate-800">{caseData.title}</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>顧問先: {caseData.clientName}</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>担当者: {caseData.assignee}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
          <span className="text-xs font-bold text-slate-500">現在のステータス:</span>
          <span className="text-sm font-bold text-indigo-700">
            {currentReviewStatus === 'pending_review' ? 'レビュー待ち' :
             currentReviewStatus === 'assignee_confirmed' ? '担当者確認済' :
             currentReviewStatus === 'expert_confirmed' ? '専門家確認済' :
             currentReviewStatus === 'delivered' ? '納品反映可' : currentReviewStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左カラム: AI入力・出力 */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <h2 className="font-bold text-slate-700">1. AI送信内容 (Prompt)</h2>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-2">※規程設計画面で生成されたプロンプト、または手動で入力した内容</p>
              <textarea
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder="AIに送信したプロンプトを貼り付けてください..."
                className="w-full h-32 p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 flex justify-between items-center">
              <h2 className="font-bold text-amber-900">2. AI回答 (Output)</h2>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">要ファクトチェック</span>
            </div>
            <div className="p-4">
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 mb-4 font-medium flex gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                AI回答は事実と異なる「ハルシネーション」を含む可能性があります。必ず一次情報（法令・通達等）の裏付けを右のEvidence欄に登録し、人間が採用可否を判断してください。
              </div>
              <textarea
                value={aiOutput}
                onChange={e => setAiOutput(e.target.value)}
                placeholder="AIからの出力結果を貼り付けてください..."
                className="w-full h-64 p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 右カラム: エビデンス・レビュー */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
              <h2 className="font-bold text-indigo-900">3. 根拠・出典 (Evidence)</h2>
              <span className="text-xs bg-white text-indigo-600 px-2 py-1 rounded-full border border-indigo-200 font-bold">
                {evidenceItems.length}件登録
              </span>
            </div>
            
            <div className="p-4 flex-1 bg-slate-50">
              {evidenceItems.length === 0 ? (
                <div className="text-center py-8 bg-white border border-dashed border-slate-300 rounded-lg">
                  <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-500 text-sm font-medium">根拠未登録</p>
                  <p className="text-slate-400 text-xs mt-1">AI回答の裏付けとなる一次情報を登録してください</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {evidenceItems.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group">
                      <button onClick={() => removeEvidence(item.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 hidden group-hover:block">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="flex gap-2 items-start mb-2">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{item.sourceType}</span>
                        <h4 className="font-bold text-sm text-slate-800 pr-6 leading-tight">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{item.summary}</p>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mb-3 truncate">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          {item.url}
                        </a>
                      )}
                      <label className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={item.isVerifiedByHuman}
                          onChange={() => toggleEvidenceVerification(item.id)}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500" 
                        />
                        <span className={`text-xs font-bold ${item.isVerifiedByHuman ? 'text-green-700' : 'text-slate-500'}`}>
                          {item.isVerifiedByHuman ? '人間による確認済' : '未確認（確認が必要です）'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {showAddEvidence ? (
                <div className="mt-4 bg-white p-4 rounded-lg border border-slate-300 shadow-sm space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm text-slate-800">根拠を手動追加</h3>
                    <button onClick={() => setShowAddEvidence(false)} className="text-xs text-slate-500 hover:text-slate-800">キャンセル</button>
                  </div>
                  <select 
                    value={newEvidence.sourceType}
                    onChange={e => setNewEvidence({...newEvidence, sourceType: e.target.value as any})}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="官公庁">官公庁</option>
                    <option value="法令">法令</option>
                    <option value="通達">通達</option>
                    <option value="Q&A">Q&A</option>
                    <option value="裁判例">裁判例</option>
                    <option value="専門団体">専門団体</option>
                    <option value="その他">その他</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="出典名 (例: 厚生労働省 ガイドライン)" 
                    value={newEvidence.title}
                    onChange={e => setNewEvidence({...newEvidence, title: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <input 
                    type="text" 
                    placeholder="URL (任意)" 
                    value={newEvidence.url}
                    onChange={e => setNewEvidence({...newEvidence, url: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <textarea 
                    placeholder="要点・確認内容" 
                    value={newEvidence.summary}
                    onChange={e => setNewEvidence({...newEvidence, summary: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-indigo-500 h-20"
                  />
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={newEvidence.isVerifiedByHuman}
                      onChange={e => setNewEvidence({...newEvidence, isVerifiedByHuman: e.target.checked})}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-700">既に内容を確認した</span>
                  </label>
                  <button 
                    onClick={handleAddEvidence}
                    disabled={!newEvidence.title || !newEvidence.summary}
                    className="w-full py-2 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    追加する
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAddEvidence(true)}
                  className="w-full mt-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  手動でEvidenceを追加する
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* レビュー＆最終判断 */}
      <div className="bg-slate-800 rounded-xl shadow-sm overflow-hidden text-white mt-8">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="font-bold text-lg">4. 内容確認・承認</h2>
          <p className="text-xs text-slate-400 mt-1">※AI回答をそのまま納品せず、必ず専門家が内容を吟味して採用可否を判断してください。</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">担当者コメント (一次確認)</label>
              <textarea
                value={staffComment}
                onChange={e => setStaffComment(e.target.value)}
                placeholder="担当者からの所感や、専門家へ確認したい点を記入..."
                className="w-full h-24 p-3 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">専門家コメント (最終確認)</label>
              <textarea
                value={expertComment}
                onChange={e => setExpertComment(e.target.value)}
                placeholder="社労士等による法的見解や、修正指示を記入..."
                className="w-full h-24 p-3 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 flex flex-col justify-center">
            <h3 className="font-bold text-sm text-slate-400 mb-4 text-center">案件ステータスを更新</h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => handleStatusChange('pending_review')}
                className={`py-3 px-4 rounded-lg font-bold text-sm transition-all border ${
                  currentReviewStatus === 'pending_review' 
                    ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                    : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                未確認 / レビュー待ちに戻す
              </button>
              <button 
                onClick={() => handleStatusChange('assignee_confirmed')}
                className={`py-3 px-4 rounded-lg font-bold text-sm transition-all border ${
                  currentReviewStatus === 'assignee_confirmed' 
                    ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                    : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                担当者確認済
              </button>
              <button 
                onClick={() => handleStatusChange('expert_confirmed')}
                className={`py-3 px-4 rounded-lg font-bold text-sm transition-all border ${
                  currentReviewStatus === 'expert_confirmed' 
                    ? 'bg-green-100 text-green-800 border-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                    : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                専門家確認済
              </button>
              <button 
                onClick={() => handleStatusChange('delivered')}
                className={`py-3 px-4 rounded-lg font-bold text-sm transition-all border ${
                  currentReviewStatus === 'delivered' 
                    ? 'bg-white text-slate-800 border-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                    : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                納品反映可
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 下部アクション：詳細画面へ戻る */}
      <div className="pt-8 flex justify-center sm:justify-end mt-8">
        <Link 
          href={`/cases/${caseId}`}
          className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-soft hover-lift shadow-sm"
        >
          詳細画面へ戻る
        </Link>
      </div>
    </div>
  );
}
