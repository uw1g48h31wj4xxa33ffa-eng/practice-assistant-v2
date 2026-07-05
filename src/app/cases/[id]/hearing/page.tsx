"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCases } from '@/hooks/useCases';
import { ExtractedInfo, VerificationStatus } from '@/types';
import VerificationCard from '@/components/features/ai/VerificationCard';

export default function HearingPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const { getCaseById, updateCase } = useCases();

  const [caseTitle, setCaseTitle] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedInfo[]>([]);

  useEffect(() => {
    const existingCase = getCaseById(caseId);
    if (existingCase) {
      setCaseTitle(existingCase.title);
      if (existingCase.extractedItems && existingCase.extractedItems.length > 0) {
        setExtractedData(existingCase.extractedItems);
        setHasExtracted(true);
      }
    }
  }, [caseId, getCaseById]);

  const handleStartExtraction = () => {
    setIsExtracting(true);
    // Simulate AI extraction delay
    setTimeout(() => {
      setExtractedData([
        {
          id: 'ext_1',
          category: '事実関係',
          content: '従業員Aからリモートワークの交通費支給について質問があった。現行規程では「実費支給」となっているが、出社日数が月5日未満の場合は定期券代を支給していない。',
          sourceReference: '2026/07/01 社長ヒアリングメモ',
          status: 'unverified',
          aiConfidence: 'high',
        },
        {
          id: 'ext_2',
          category: '課題・論点',
          content: '現行の就業規則において、出社日数に応じた通勤手当の明確な支給基準が定められておらず、従業員間で不公平感が生じているリスクがある。',
          sourceReference: '2026/07/01 社長ヒアリングメモ',
          status: 'unverified',
          aiConfidence: 'high',
        },
        {
          id: 'ext_3',
          category: '不足情報',
          content: '従業員Aの現在の契約形態（正社員か契約社員か）が不明です。',
          sourceReference: '2026/07/01 社長ヒアリングメモ',
          status: 'unverified',
          aiConfidence: 'medium',
        },
        {
          id: 'ext_4',
          category: 'リスク',
          content: '労働基準法第89条に基づき、通勤手当に関する事項は就業規則の絶対的必要記載事項であるため、現状の運用ルールと規程の乖離は法的なリスクとなる。',
          sourceReference: 'AI推論（厚労省ガイドライン）',
          status: 'unverified',
          aiConfidence: 'medium',
        }
      ]);
      setIsExtracting(false);
      setHasExtracted(true);
    }, 2000);
  };

  const handleStatusChange = (id: string, newStatus: VerificationStatus, newContent?: string, rejectReason?: string) => {
    setExtractedData(prev => prev.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          status: newStatus, 
          ...(newContent !== undefined ? { content: newContent } : {}),
          ...(rejectReason !== undefined ? { rejectReason } : {})
        };
      }
      return item;
    }));
  };

  const unverifiedCount = extractedData.filter(d => d.status === 'unverified').length;
  const rejectedCount = extractedData.filter(d => d.status === 'rejected').length;
  const canProceed = hasExtracted && unverifiedCount === 0;

  const handleProceed = () => {
    // 現在の案件情報を取得して分岐
    const existingCase = getCaseById(caseId);
    const isSubsidy = existingCase?.templateId === 'subsidy_v1' || existingCase?.caseType === '補助金支援';

    // 案件データに抽出・確認結果と次のステータスを保存する
    updateCase(caseId, { 
      extractedItems: extractedData,
      progressStatus: isSubsidy ? 'guideline_review' : 'rule_design'
    });
    
    // テンプレートに応じた遷移先へ進む
    if (isSubsidy) {
      router.push(`/cases/${caseId}/subsidy-guideline`);
    } else {
      router.push(`/cases/${caseId}/rule-design`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/cases/${caseId}`} className="text-slate-500 hover:text-indigo-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">1. ヒアリング内容の整理と確認</h1>
          <p className="text-sm text-slate-500 mt-1">{caseTitle || '読込中...'} - 案件ID: {caseId}</p>
        </div>
      </div>

      {!hasExtracted ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002 2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">過去データの取り込みとAI抽出</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            ヒアリングのメモや関連資料を読み込み、AIが自動で事実関係、論点、リスクを抽出します。あなたは抽出された結果を「確認」「修正」するだけで作業が完了します。
          </p>
          <button 
            onClick={handleStartExtraction}
            disabled={isExtracting}
            className={`px-8 py-3 rounded-lg font-bold text-white transition-all shadow-sm ${
              isExtracting ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
            }`}
          >
            {isExtracting ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI抽出を実行中...
              </span>
            ) : 'ヒアリングメモを読み込んで抽出開始'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-slate-800">AIによる抽出結果</h2>
              <p className="text-sm text-slate-500">抽出された内容を確認し、正しければ「確認する」を押してください。修正も可能です。</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-700">
                未確認: <span className="text-rose-600 text-lg">{unverifiedCount}</span> 件 / 全 {extractedData.length} 件
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {extractedData.map((info, idx) => (
              <div 
                key={info.id} 
                className="animate-[fadeIn_0.3s_ease-out_both]"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <VerificationCard 
                  info={info} 
                  onStatusChange={handleStatusChange} 
                />
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center mt-8">
            <h3 className="font-bold text-slate-800 mb-2">確認作業は完了しましたか？</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md">
              すべての抽出項目を確認（または修正・却下）すると、承認して次の工程（{getCaseById(caseId)?.templateId === 'subsidy_v1' || getCaseById(caseId)?.caseType === '補助金支援' ? '公募要項整理' : '規程設計'}）へ進むことができます。
            </p>
            
            {rejectedCount > 0 && (
              <div className="mb-4 text-xs font-bold text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                ⚠️ 却下された抽出項目が {rejectedCount} 件あります。
              </div>
            )}

            <button 
              disabled={!canProceed}
              onClick={handleProceed}
              className={`px-8 py-3 rounded-lg font-bold transition-all ${
                canProceed 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {getCaseById(caseId)?.templateId === 'subsidy_v1' || getCaseById(caseId)?.caseType === '補助金支援' ? '確認結果を承認して公募要項整理へ進む' : '確認結果を承認して規程設計へ進む'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
