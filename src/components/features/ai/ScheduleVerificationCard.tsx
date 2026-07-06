"use client";

import React, { useState, useEffect } from 'react';
import { SubsidyScheduleItem, ScheduleVerificationStatus, ScheduleProgressStatus } from '@/types';

interface ScheduleVerificationCardProps {
  item: SubsidyScheduleItem;
  onStatusChange: (
    id: string, 
    newVerificationStatus: ScheduleVerificationStatus, 
    newProgressStatus?: ScheduleProgressStatus, 
    newNotes?: string, 
    newRiskNote?: string
  ) => void;
  style?: React.CSSProperties;
}

export default function ScheduleVerificationCard({ item, onStatusChange, style }: ScheduleVerificationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(item.notes || '');
  const [editRiskNote, setEditRiskNote] = useState(item.riskNote || '');
  const [editProgressStatus, setEditProgressStatus] = useState<ScheduleProgressStatus>(item.progressStatus);
  
  const [isRejecting, setIsRejecting] = useState(false);
  // We use notes as rejectReason if rejected
  const [rejectReason, setRejectReason] = useState(item.notes || '');

  useEffect(() => {
    if (!isEditing) {
      setEditNotes(item.notes || '');
      setEditRiskNote(item.riskNote || '');
      setEditProgressStatus(item.progressStatus);
    }
  }, [item.notes, item.riskNote, item.progressStatus, isEditing]);

  useEffect(() => {
    if (!isRejecting) {
      setRejectReason(item.notes || '');
    }
  }, [item.notes, isRejecting]);

  const handleVerify = () => {
    onStatusChange(item.id, 'verified');
    setIsEditing(false);
    setIsRejecting(false);
  };

  const handleSaveEdit = () => {
    onStatusChange(item.id, 'modified', editProgressStatus, editNotes, editRiskNote);
    setIsEditing(false);
  };

  const handleReject = () => {
    onStatusChange(item.id, 'rejected', 'not_required', rejectReason, item.riskNote);
    setIsRejecting(false);
  };

  const verificationConfig = {
    unverified: { color: 'bg-rose-50 text-rose-700 border-rose-200', label: '未確認', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    verified: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: '確認済', icon: 'M5 13l4 4L19 7' },
    modified: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: '修正済・再確認待ち', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    rejected: { color: 'bg-slate-100 text-slate-500 border-slate-300', label: '対象外', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
  };

  const progressConfig = {
    not_started: { color: 'bg-slate-100 text-slate-600', label: '未着手' },
    in_progress: { color: 'bg-indigo-100 text-indigo-700', label: '進行中' },
    done: { color: 'bg-emerald-100 text-emerald-800', label: '完了' },
    delayed: { color: 'bg-rose-100 text-rose-800', label: '遅延' },
    at_risk: { color: 'bg-amber-100 text-amber-800', label: '要注意' },
    not_required: { color: 'bg-slate-100 text-slate-600', label: '対象外' },
  };

  const vConf = verificationConfig[item.verificationStatus];
  const pConf = progressConfig[item.progressStatus];

  return (
    <div 
      className={`border rounded-xl p-4 transition-all duration-300 ease-out ${
        item.verificationStatus === 'rejected' ? 'bg-slate-50 opacity-75' : 'bg-white shadow-sm hover:shadow-md hover:border-slate-300'
      } ${item.verificationStatus === 'unverified' ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'}`}
      style={style}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
        <div className="flex flex-col gap-1.5 w-full md:w-auto">
          <div className="flex flex-row items-center justify-between w-full md:w-auto gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                {item.category}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${pConf.color}`}>
                {pConf.label}
              </span>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border transition-colors duration-300 whitespace-nowrap ${vConf.color}`}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={vConf.icon} />
                </svg>
                {vConf.label}
              </span>
            </div>
            
            {item.importance === 'high' && item.verificationStatus !== 'rejected' && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex shrink-0 items-center gap-1 whitespace-nowrap">
                重要
              </span>
            )}
          </div>
          <h3 className={`font-bold text-base mt-1 min-w-0 break-words whitespace-normal leading-relaxed ${item.verificationStatus === 'rejected' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {item.title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-lg mt-1 w-fit">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {item.dueDate}
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-2 text-sm text-slate-600">
        {item.aiMemo && (
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded text-indigo-900 text-xs min-w-0 break-words whitespace-normal leading-relaxed">
            <span className="font-bold flex items-center gap-1 mb-1 whitespace-nowrap w-fit">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AIメモ
            </span>
            {item.aiMemo}
          </div>
        )}
      </div>

      <div className="mb-4 relative">
        {isEditing ? (
          <div className="animate-[fadeIn_0.2s_ease-out] space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">進行状況の変更</label>
              <select 
                value={editProgressStatus} 
                onChange={(e) => setEditProgressStatus(e.target.value as ScheduleProgressStatus)}
                className="w-full text-base sm:text-sm border border-slate-300 rounded-lg p-2 min-h-[44px] focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="not_started">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="done">完了</option>
                <option value="delayed">遅延</option>
                <option value="at_risk">要注意</option>
                <option value="not_required">不要（対象外）</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">リスク・注意点（警告表示用）</label>
              <input 
                type="text"
                className="w-full text-base sm:text-sm border border-indigo-300 rounded-lg p-2 min-h-[44px] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
                value={editRiskNote} 
                onChange={e => setEditRiskNote(e.target.value)} 
                placeholder="例: クライアントへの確認が遅れている"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">メモ</label>
              <textarea 
                className="w-full text-base sm:text-sm border border-indigo-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
                rows={2} 
                value={editNotes} 
                onChange={e => setEditNotes(e.target.value)} 
                placeholder="進行状況に関するメモ"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 min-h-[44px] sm:min-h-[auto] sm:py-1.5 text-sm sm:text-xs font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">キャンセル</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 min-h-[44px] sm:min-h-[auto] sm:py-1.5 text-sm sm:text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">修正を保存</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {item.riskNote && item.verificationStatus !== 'rejected' && (
              <div className="text-sm p-2 bg-amber-50 rounded border border-amber-200 text-amber-800 transition-all duration-300 min-w-0 break-words whitespace-normal leading-relaxed">
                <span className="font-semibold text-amber-700 text-xs flex items-center gap-1 mb-1 whitespace-nowrap w-fit">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  リスク・注意点
                </span>
                {item.riskNote}
              </div>
            )}
            {item.notes && (
              <div className={`text-sm p-2 bg-slate-50 rounded border border-slate-200 transition-all duration-300 min-w-0 break-words whitespace-normal leading-relaxed ${item.verificationStatus === 'rejected' ? 'opacity-50' : 'text-slate-700'}`}>
                <span className="font-semibold text-slate-500 text-xs block mb-1 whitespace-nowrap w-fit">メモ：</span>
                {item.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={handleVerify}
              className={`flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2 min-h-[44px] rounded-lg text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto ${
                item.verificationStatus === 'verified' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {item.verificationStatus === 'verified' ? '確認済' : item.verificationStatus === 'modified' ? '再確認する' : '確認する'}
            </button>
            
            <button 
              onClick={() => { 
                setIsEditing(true); 
                setIsRejecting(false); 
                if (item.verificationStatus === 'verified' || item.verificationStatus === 'modified' || item.verificationStatus === 'rejected') {
                  onStatusChange(item.id, 'unverified');
                }
              }}
              className={`px-4 py-3 sm:py-2 min-h-[44px] bg-white border text-sm font-bold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm w-full sm:w-auto text-center ${
                item.verificationStatus === 'modified' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.verificationStatus === 'modified' ? '再修正する' : '修正する'}
            </button>
          </div>

          <div className="relative flex justify-end sm:justify-start">
            {isRejecting ? (
              <>
                {/* スマホ用背景オーバーレイ */}
                <div className="fixed inset-0 bg-slate-900/20 z-[60] sm:hidden" onClick={() => setIsRejecting(false)} />
                {/* ポップアップ本体 */}
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-white border border-slate-200 shadow-xl rounded-xl p-5 z-[70] animate-[fadeIn_0.15s_ease-out]
                                sm:absolute sm:top-auto sm:left-auto sm:bottom-full sm:right-0 sm:transform-none sm:w-64 sm:shadow-lg sm:rounded-lg sm:p-3 sm:mb-2 sm:z-10">
                  <label className="block text-sm sm:text-xs font-bold text-slate-700 mb-2 sm:mb-1">対象外とする理由（任意）</label>
                  <input 
                    type="text" 
                    className="w-full text-base sm:text-xs border border-slate-300 rounded p-3 sm:p-2 focus:ring-2 focus:ring-indigo-500 mb-4 sm:mb-2 transition-colors" 
                    placeholder="例: スケジュール調整不要のため"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    autoFocus
                  />
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
                    <button onClick={() => setIsRejecting(false)} className="w-full sm:w-auto text-sm sm:text-xs py-2 min-h-[44px] sm:min-h-[auto] sm:px-3 sm:py-1.5 font-medium text-slate-600 border border-slate-300 sm:border-transparent sm:text-slate-500 rounded-lg sm:rounded hover:bg-slate-50 sm:hover:bg-transparent sm:hover:text-slate-700 transition-colors">キャンセル</button>
                    <button onClick={handleReject} className="w-full sm:w-auto text-sm sm:text-xs font-medium bg-slate-800 text-white py-2 min-h-[44px] sm:min-h-[auto] sm:px-3 sm:py-1.5 rounded-lg sm:rounded hover:bg-slate-900 transition-colors">対象外にする</button>
                  </div>
                </div>
              </>
            ) : (
              <button 
                onClick={() => {
                  setIsRejecting(true);
                  if (item.verificationStatus === 'verified' || item.verificationStatus === 'modified') {
                    onStatusChange(item.id, 'unverified');
                  }
                }}
                className={`text-xs font-medium min-h-[44px] sm:min-h-[auto] px-2 sm:px-0 py-2 sm:py-0 transition-colors hover:underline ${
                  item.verificationStatus === 'rejected' ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {item.verificationStatus === 'rejected' ? '対象外（理由を変更）' : '対象外にする'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
