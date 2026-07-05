"use client";

import React, { useState, useEffect } from 'react';
import { ExtractedInfo, VerificationStatus } from '@/types';

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

  const statusConfig = {
    unverified: { color: 'bg-rose-50 text-rose-700 border-rose-200', label: '未確認', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    verified: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: '確認済', icon: 'M5 13l4 4L19 7' },
    modified: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: '修正済・再確認待ち', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    rejected: { color: 'bg-slate-100 text-slate-500 border-slate-300', label: '却下済', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
  };

  const conf = statusConfig[info.status];

  return (
    <div 
      className={`border rounded-xl p-4 transition-all duration-300 ease-out transform ${
        info.status === 'rejected' ? 'bg-slate-50 opacity-75' : 'bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
      } ${info.status === 'unverified' ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'}`}
      style={style}
    >
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {info.category}
          </span>
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border transition-colors duration-300 ${conf.color}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={conf.icon} />
            </svg>
            {conf.label}
          </span>
        </div>
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          出典: {info.sourceReference}
        </div>
      </div>

      <div className="mb-4 relative">
        {isEditing ? (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <textarea 
              className="w-full text-sm border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
              rows={3} 
              value={editContent} 
              onChange={e => setEditContent(e.target.value)} 
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">キャンセル</button>
              <button onClick={handleSaveEdit} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">修正を保存</button>
            </div>
          </div>
        ) : (
          <p className={`text-sm transition-all duration-300 ${info.status === 'rejected' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {info.content}
          </p>
        )}
        
        {info.status === 'rejected' && info.rejectReason && !isRejecting && !isEditing && (
          <div className="mt-3 p-2 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200 transition-all duration-300">
            <span className="font-bold">却下理由: </span>{info.rejectReason}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleVerify}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                info.status === 'verified' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className={`px-4 py-2 bg-white border text-sm font-bold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                info.status === 'modified' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {info.status === 'modified' ? '再修正する' : '修正する'}
            </button>
          </div>

          <div className="relative">
            {isRejecting ? (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-slate-200 shadow-lg rounded-lg p-3 z-10 animate-[fadeIn_0.15s_ease-out]">
                <label className="block text-xs font-bold text-slate-700 mb-1">却下理由（任意）</label>
                <input 
                  type="text" 
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-indigo-500 mb-2 transition-colors" 
                  placeholder="例: 事実誤認、不要な情報など"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsRejecting(false)} className="text-xs text-slate-500 hover:text-slate-700 transition-colors">キャンセル</button>
                  <button onClick={handleReject} className="text-xs bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-900 transition-colors">却下を確定</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setIsRejecting(true);
                  if (info.status === 'verified' || info.status === 'modified') {
                    onStatusChange(info.id, 'unverified', info.content, info.rejectReason);
                  }
                }}
                className={`text-xs font-medium transition-colors hover:underline ${
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
