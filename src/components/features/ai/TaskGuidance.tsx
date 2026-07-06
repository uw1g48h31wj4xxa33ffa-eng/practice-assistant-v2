"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AITaskTemplate, Case, ExtractedInfo } from '@/types';

interface TaskGuidanceProps {
  task: AITaskTemplate;
  caseData?: Case;
}

export default function TaskGuidance({ task, caseData }: TaskGuidanceProps) {
  // generated = AIが自動生成した原文（読み取り専用の参照）
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  // editable = 画面に表示・人間が編集するテキスト
  const [editablePrompt, setEditablePrompt] = useState('');
  // 人間が一度でも手を入れたかのフラグ
  const [isPromptEdited, setIsPromptEdited] = useState(false);

  // コンテキストリセットを判定するためのRef
  const prevContextRef = React.useRef({ taskId: '', caseId: '' });

  // 却下以外のデータを useMemo でメモ化（レンダーごとに新しい配列が生成されるのを防ぐ）
  const validItems = useMemo(
    () => caseData?.extractedItems?.filter(i => i.status !== 'rejected') ?? [],
    [caseData?.extractedItems]
  );

  // プロンプト自動生成ロジック
  // 依存配列は task.id と caseData?.id のみ。
  // → task または 案件が切り替わった時だけ再生成する。
  // → validItems を依存配列に入れない（VerificationCardの操作ごとに上書きされるのを防ぐ）
  useEffect(() => {
    let prompt = task.promptTemplate;

    // プレースホルダーを削除
    prompt = prompt
      .replace('[ここにメモを入力]', '')
      .replace('[ここにテーマを入力]', '')
      .replace('1.\n2.', '');

    if (caseData) {
      let autoContext = `\n\n【前提条件】\n`;
      autoContext += `- 案件名: ${caseData.title}\n`;
      autoContext += `- 顧問先: ${caseData.clientName}\n`;

      if (validItems.length > 0) {
        autoContext += `\n【ヒアリング・抽出済み情報】\n`;
        const grouped = validItems.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {} as Record<string, ExtractedInfo[]>);

        Object.keys(grouped).forEach(cat => {
          autoContext += `\n■ ${cat}\n`;
          grouped[cat].forEach(item => {
            autoContext += `- ${item.content}\n`;
          });
        });
      }
      prompt = prompt.trim() + autoContext;
    }

    const generated = prompt.trim();
    setGeneratedPrompt(generated);

    // 案件IDまたはタスクIDが変わった（＝画面切り替え・タスク切り替え）場合のみ、編集状態をリセットする
    const isContextChanged = 
      prevContextRef.current.taskId !== task.id || 
      prevContextRef.current.caseId !== caseData?.id;

    if (isContextChanged) {
      setIsPromptEdited(false);
      setEditablePrompt(generated);
      prevContextRef.current = { taskId: task.id, caseId: caseData?.id || '' };
    } else if (!isPromptEdited) {
      // ユーザーがまだ編集していない場合は、最新のAI生成内容を反映
      setEditablePrompt(generated);
    }
  }, [task.id, caseData?.id, task.promptTemplate, caseData?.title, caseData?.clientName, validItems]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
      <div className="bg-slate-800 p-4 text-white">
        <h3 className="text-lg font-bold">{task.name} - ガイドライン</h3>
        <p className="text-sm text-slate-300 mt-1">以下の手順と確認事項に沿って作業を進めてください。</p>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-700 border-b pb-2 mb-3">推奨される作業手順</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
                {task.recommendedSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-700 border-b pb-2 mb-3">内部処理・推奨ツール（参考情報）</h4>
              <div className="bg-slate-50 p-3 rounded-lg text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">必要とされる能力:</span>
                  <span className="font-medium text-slate-700">{task.recommendedCapability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">推奨ツール:</span>
                  <span className="font-medium text-slate-700">{task.recommendedProvider}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-700 border-b pb-2 mb-3">品質担保・レビュー要件</h4>
              <div className="space-y-2">
                <div className={`p-3 rounded-lg flex items-start gap-3 border ${task.evidenceRequired ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <svg className={`w-5 h-5 shrink-0 ${task.evidenceRequired ? 'text-amber-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-bold text-sm">根拠・出典の確認</div>
                    <div className="text-xs mt-1">{task.evidenceRequired ? '必須：AIの回答を鵜呑みにせず、必ず一次情報（条文・通達など）のURLや現物を確認してください。' : '任意：必要に応じて情報の裏付けを取ってください。'}</div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg flex items-start gap-3 border ${task.humanReviewRequired ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <svg className={`w-5 h-5 shrink-0 ${task.humanReviewRequired ? 'text-blue-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <div className="font-bold text-sm">担当者による目視確認</div>
                    <div className="text-xs mt-1">{task.humanReviewRequired ? '必須：意図した出力になっているか、誤字脱字や文脈の破綻がないか担当者が確認してください。' : '任意：基本的なチェックのみで進めることができます。'}</div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg flex items-start gap-3 border ${task.expertReviewRequired ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <svg className={`w-5 h-5 shrink-0 ${task.expertReviewRequired ? 'text-red-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <div className="font-bold text-sm">専門家（有資格者）の判断</div>
                    <div className="text-xs mt-1">{task.expertReviewRequired ? '必須：法的妥当性や最終的なリスク判断について、必ず有資格者による審査を行ってください。' : '不要：この目的自体には専門的な法的判断は不要です。'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {caseData && validItems.length > 0 && (
          <div className="border-t pt-6">
            <h4 className="text-sm font-bold text-slate-700 mb-2">AIへ送信される情報一覧（自動連携）</h4>
            <p className="text-xs text-slate-500 mb-3">前工程で確認された以下のデータがAIのコンテキストとして使用されます。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validItems.map(item => (
                <div key={item.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 inline-block">
                      {item.category}
                    </div>
                    {item.status === 'modified' && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        修正済内容
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{item.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-6">
          <h4 className="text-sm font-bold text-slate-700 mb-2">自動生成されたプロンプト</h4>
          <p className="text-xs text-slate-500 mb-3">
            案件データから自動生成されました。内容を確認し、必要があれば微修正してください。
            {isPromptEdited && (
              <span className="ml-2 text-amber-600 font-bold">（編集済み）</span>
            )}
          </p>
          <textarea 
            className="w-full bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            rows={12}
            value={editablePrompt}
            onChange={(e) => {
              setEditablePrompt(e.target.value);
              setIsPromptEdited(true);
            }}
          />
          <div className="flex flex-col sm:flex-row justify-end mt-3 gap-3 sm:gap-4">
            <button 
              onClick={() => {
                setEditablePrompt(generatedPrompt);
                setIsPromptEdited(false);
              }}
              className="px-4 sm:px-6 py-3 w-full sm:w-auto border border-slate-300 text-slate-700 rounded font-medium text-sm sm:text-base hover:bg-slate-50 transition-colors whitespace-nowrap text-center"
            >
              内容を戻す
            </button>
            <button className="px-4 sm:px-6 py-3 w-full sm:w-auto bg-indigo-600 text-white rounded font-medium text-sm sm:text-base hover:bg-indigo-700 transition-colors whitespace-nowrap text-center">
              AIツールを開く
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
