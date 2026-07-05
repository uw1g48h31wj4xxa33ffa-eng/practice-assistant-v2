"use client";

import React from 'react';
import { AITaskTemplate, taskTemplates } from '@/types';

interface TaskSelectorProps {
  onSelect: (task: AITaskTemplate) => void;
  selectedTaskId?: string;
}

export default function TaskSelector({ onSelect, selectedTaskId }: TaskSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">何をしたいですか？（業務目的の選択）</h2>
      <p className="text-sm text-slate-500 mb-4">
        AIに行わせたい作業ではなく、あなたが達成したい業務の目的を選んでください。
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {taskTemplates.map((task) => {
          const isSelected = task.id === selectedTaskId;
          return (
            <button
              key={task.id}
              onClick={() => onSelect(task)}
              className={`p-4 rounded-xl border text-left transition-colors flex flex-col gap-1 ${
                isSelected 
                  ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-slate-800 flex items-center justify-between">
                {task.name}
                {isSelected && (
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-xs text-slate-500 line-clamp-2">
                {task.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
