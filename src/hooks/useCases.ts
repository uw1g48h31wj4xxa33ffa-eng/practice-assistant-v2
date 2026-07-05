"use client";

import { useState, useEffect, useCallback } from 'react';
import { Case, mockCases } from '@/types';

export function normalizeCase(raw: any): Case {
  return {
    id: raw?.id || `case_${Date.now()}`,
    title: raw?.title || '（無題）',
    clientName: raw?.clientName || '（未設定）',
    caseType: raw?.caseType || 'その他',
    dueDate: raw?.dueDate || '',
    priority: ['high', 'medium', 'low'].includes(raw?.priority) ? raw.priority : 'medium',
    assignee: raw?.assignee || '未定',
    templateId: raw?.templateId,
    industry: raw?.industry || '未確認',
    employeeCount: raw?.employeeCount || '未確認',
    clientContactPerson: raw?.clientContactPerson || '',
    reviewStatus: ['pending_review', 'assignee_confirmed', 'expert_confirmed', 'delivered'].includes(raw?.reviewStatus) ? raw.reviewStatus : 'pending_review',
    progressStatus: ['hearing', 'rule_design', 'ai_review', 'delivery_prep', 'completed', 'guideline_review', 'document_prep', 'schedule_management'].includes(raw?.progressStatus) ? raw.progressStatus : 'hearing',
    memo: raw?.memo || '',
    createdAt: raw?.createdAt || new Date().toISOString().split('T')[0],
    extractedItems: Array.isArray(raw?.extractedItems) ? raw.extractedItems : [],
    subsidyGuidelineItems: Array.isArray(raw?.subsidyGuidelineItems) ? raw.subsidyGuidelineItems : [],
    subsidyDocumentItems: Array.isArray(raw?.subsidyDocumentItems) ? raw.subsidyDocumentItems : [],
    subsidyScheduleItems: Array.isArray(raw?.subsidyScheduleItems) ? raw.subsidyScheduleItems : [],
    subsidyDeliveryItems: Array.isArray(raw?.subsidyDeliveryItems) ? raw.subsidyDeliveryItems : [],
    validationRecord: raw?.validationRecord ? {
      promptText: raw.validationRecord.promptText || '',
      aiOutput: raw.validationRecord.aiOutput || '',
      evidenceItems: Array.isArray(raw.validationRecord.evidenceItems) ? raw.validationRecord.evidenceItems : [],
      staffComment: raw.validationRecord.staffComment || '',
      expertComment: raw.validationRecord.expertComment || ''
    } : undefined
  };
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  // ローカルストレージからの初期化が終わったかを示すフラグ
  // これがfalseの間はSSR時とクライアント初期描画の数値が不一致のままなので表示しない
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('practice_assistant_v2_cases');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Case[];
        const normalizedStored = parsed.map(normalizeCase);
        // localStorageの案件IDをSetで管理し、重複するmockCasesを除外する
        // localStorageの更新済みデータが優先される
        const storedIds = new Set(normalizedStored.map(c => c.id));
        const uniqueMocks = mockCases.filter(c => !storedIds.has(c.id));
        setCases([...normalizedStored, ...uniqueMocks]);
      } catch (e) {
        console.error("Failed to parse cases from localStorage", e);
        setCases(mockCases);
      }
    } else {
      setCases(mockCases);
    }
    setIsLoaded(true);
  }, []);

  const addCase = useCallback((newCase: Case) => {
    const stored = localStorage.getItem('practice_assistant_v2_cases');
    let parsed: Case[] = [];
    if (stored) {
      try {
        parsed = (JSON.parse(stored) as any[]).map(normalizeCase);
      } catch (e) {
        console.error("Failed to parse cases from localStorage", e);
      }
    }
    
    const normalizedNew = normalizeCase(newCase);
    const updatedStored = [normalizedNew, ...parsed];
    localStorage.setItem('practice_assistant_v2_cases', JSON.stringify(updatedStored));
    
    // Update local state
    setCases(prev => [normalizedNew, ...prev]);
  }, []);

  const getCaseById = useCallback((id: string): Case | undefined => {
    const found = cases.find(c => c.id === id);
    return found ? normalizeCase(found) : undefined;
  }, [cases]);

  const updateCaseStatus = useCallback((id: string, newReviewStatus: Case['reviewStatus']) => {
    const stored = localStorage.getItem('practice_assistant_v2_cases');
    let parsed: Case[] = [];
    if (stored) {
      try {
        parsed = (JSON.parse(stored) as any[]).map(normalizeCase);
      } catch (e) {
        console.error(e);
      }
    }

    // Check if it's a mock case being modified. If so, we should probably add it to localStorage to persist it.
    // For simplicity, we just modify the state here, and if it's in localStorage, update it there.
    const isStored = parsed.some(c => c.id === id);
    if (isStored) {
      const updatedStored = parsed.map(c => c.id === id ? normalizeCase({ ...c, reviewStatus: newReviewStatus }) : c);
      localStorage.setItem('practice_assistant_v2_cases', JSON.stringify(updatedStored));
    } else {
      // If a mock case is modified, we save a copy to localStorage to persist the change.
      const mockCase = mockCases.find(c => c.id === id);
      if (mockCase) {
        const updatedStored = [normalizeCase({ ...mockCase, reviewStatus: newReviewStatus }), ...parsed];
        localStorage.setItem('practice_assistant_v2_cases', JSON.stringify(updatedStored));
      }
    }

    setCases(prev => prev.map(c => c.id === id ? normalizeCase({ ...c, reviewStatus: newReviewStatus }) : c));
  }, []);

  const updateCase = useCallback((id: string, updatedCaseData: Partial<Case>) => {
    const stored = localStorage.getItem('practice_assistant_v2_cases');
    let parsed: Case[] = [];
    if (stored) {
      try {
        parsed = (JSON.parse(stored) as any[]).map(normalizeCase);
      } catch (e) {
        console.error(e);
      }
    }

    const isStored = parsed.some(c => c.id === id);
    if (isStored) {
      const updatedStored = parsed.map(c => c.id === id ? normalizeCase({ ...c, ...updatedCaseData }) : c);
      localStorage.setItem('practice_assistant_v2_cases', JSON.stringify(updatedStored));
    } else {
      const mockCase = mockCases.find(c => c.id === id);
      if (mockCase) {
        const updatedStored = [normalizeCase({ ...mockCase, ...updatedCaseData }), ...parsed];
        localStorage.setItem('practice_assistant_v2_cases', JSON.stringify(updatedStored));
      }
    }

    setCases(prev => prev.map(c => c.id === id ? normalizeCase({ ...c, ...updatedCaseData }) : c));
  }, []);

  return { cases, isLoaded, addCase, getCaseById, updateCaseStatus, updateCase };
}
