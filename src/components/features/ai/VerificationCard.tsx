"use client";

import React, { useState, useEffect } from 'react';
import { ExtractedInfo, VerificationStatus } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

interface VerificationCardProps {
  info: ExtractedInfo;
  onStatusChange: (id: string, newStatus: VerificationStatus, newContent?: string, rejectReason?: string) => void;
  style?: React.CSSProperties;
}

export default function VerificationCard({ info, onStatusChange, style }: VerificationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(info.content);
  
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState(info.rejectReason || '');

  // info.content や info.rejectReason が親から更新された場合に内部stateを同期する
  // ただし編集中（isEditing / isRejecting）は上書きしない
  useEffect(() => {
    if (!isEditing) {
      setEditContent(info.content);
    }
  }, [info.content, isEditing]);

  useEffect(() => {
    if (!isRejecting) {
      setRejectReason(info.rejectReason || '');
    }
  }, [info.rejectReason, isRejecting]);

  const handleVerify = () => {
    onStatusChange(info.id, 'verified');
    setIsEditing(false);
    setIsRejecting(false);
  };

  const handleSaveEdit = () => {
    onStatusChange(info.id, 'modified', editContent);
    setIsEditing(false);
  };

  const handleReject = () => {
    onStatusChange(info.id, 'rejected', undefined, rejectReason);
    setIsRejecting(false);
  };




  return (
    <div 
      className={`border rounded-xl p-4 transition-all duration-300 ease-out ${
        info.status === 'rejected' ? 'bg-slate-50 opacity-75' : 'bg-white shadow-sm hover:shadow-md hover:border-slate-300'
      } ${info.status === 'unverified' ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'}`}
      style={style}
    >
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
            {info.category}
          </span>
          <StatusBadge 
            status={info.status} 
            rejectedLabel="却下済" 
            className="px-2 py-1" 
          />
        </div>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1 min-w-0">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="break-words min-w-0 whitespace-normal leading-relaxed">出典: {info.sourceReference}</span>
        </div>
      </div>

      <div className="mb-4 relative">
        {isEditing ? (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <textarea 
              className="w-full text-base sm:text-sm border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
              rows={3} 
              value={editContent} 
              onChange={e => setEditContent(e.target.value)} 
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 min-h-[44px] sm:min-h-[auto] sm:py-1.5 text-sm sm:text-xs font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">キャンセル</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 min-h-[44px] sm:min-h-[auto] sm:py-1.5 text-sm sm:text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">修正を保存</button>
            </div>
          </div>
        ) : (
          <p className={`text-sm transition-all duration-300 min-w-0 break-words whitespace-normal leading-relaxed ${info.status === 'rejected' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {info.content}
          </p>
        )}
        
        {info.status === 'rejected' && info.rejectReason && !isRejecting && !isEditing && (
          <div className="mt-3 p-2 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200 transition-all duration-300 min-w-0 break-words whitespace-normal leading-relaxed">
            <span className="font-bold">却下理由: </span>{info.rejectReason}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={handleVerify}
              className={`flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2 min-h-[44px] rounded-lg text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto ${
                info.status === 'verified' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {info.status === 'verified' ? '確認済' : info.status === 'modified' ? '再確認する' : '確認する'}
            </button>
            
            <button 
              onClick={() => { 
                setIsEditing(true); 
                setIsRejecting(false); 
                if (info.status === 'verified' || info.status === 'modified' || info.status === 'rejected') {
                  onStatusChange(info.id, 'unverified', info.content, info.rejectReason);
                }
              }}
              className={`px-4 py-3 sm:py-2 min-h-[44px] bg-white border text-sm font-bold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm w-full sm:w-auto text-center ${
                info.status === 'modified' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {info.status === 'modified' ? '再修正する' : '修正する'}
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
                  <label className="block text-sm sm:text-xs font-bold text-slate-700 mb-2 sm:mb-1">却下理由（任意）</label>
                  <input 
                    type="text" 
                    className="w-full text-base sm:text-xs border border-slate-300 rounded p-3 sm:p-2 focus:ring-2 focus:ring-indigo-500 mb-4 sm:mb-2 transition-colors" 
                    placeholder="例: 事実誤認、不要な情報など"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    autoFocus
                  />
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
                    <button onClick={() => setIsRejecting(false)} className="w-full sm:w-auto text-sm sm:text-xs py-2 min-h-[44px] sm:min-h-[auto] sm:px-3 sm:py-1.5 font-medium text-slate-600 border border-slate-300 sm:border-transparent sm:text-slate-500 rounded-lg sm:rounded hover:bg-slate-50 sm:hover:bg-transparent sm:hover:text-slate-700 transition-colors">キャンセル</button>
                    <button onClick={handleReject} className="w-full sm:w-auto text-sm sm:text-xs font-medium bg-slate-800 text-white py-2 min-h-[44px] sm:min-h-[auto] sm:px-3 sm:py-1.5 rounded-lg sm:rounded hover:bg-slate-900 transition-colors">却下を確定</button>
                  </div>
                </div>
              </>
            ) : (
              <button 
                onClick={() => {
                  setIsRejecting(true);
                  if (info.status === 'verified' || info.status === 'modified') {
                    onStatusChange(info.id, 'unverified', info.content, info.rejectReason);
                  }
                }}
                className={`text-xs font-medium min-h-[44px] sm:min-h-[auto] px-2 sm:px-0 py-2 sm:py-0 transition-colors hover:underline ${
                  info.status === 'rejected' ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {info.status === 'rejected' ? '却下済（理由を変更）' : '却下する'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
