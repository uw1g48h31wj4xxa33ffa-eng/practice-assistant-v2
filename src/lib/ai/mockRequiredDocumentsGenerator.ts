import { ExtractedInfo, RequiredDocument } from '@/types';

export function buildMockRequiredDocumentsFromGuidelineItems(
  subsidyGuidelineItems: ExtractedInfo[]
): RequiredDocument[] {
  // A simple generator that creates a standard set of required documents.
  // In a real application, this would use an LLM or complex logic based on the extracted items.

  const now = new Date().toISOString();

  const documents: RequiredDocument[] = [
    {
      id: `doc_${Date.now()}_1`,
      name: '決算書（直近2期分）',
      requiredType: 'required',
      reason: '申請要件として企業の財務状況の確認が必要なため',
      sourceReference: '公募要項 第3章 提出書類について',
      status: 'not_started',
      priority: 'high',
      dueDate: '',
      assignee: '未定',
      memo: '',
      createdBy: 'ai',
      updatedAt: now,
    },
    {
      id: `doc_${Date.now()}_2`,
      name: '見積書（対象経費分）',
      requiredType: 'required',
      reason: '補助対象となる経費の妥当性を証明するため',
      sourceReference: '公募要項 第4章 対象経費',
      status: 'not_started',
      priority: 'high',
      dueDate: '',
      assignee: '未定',
      memo: '',
      createdBy: 'ai',
      updatedAt: now,
    },
    {
      id: `doc_${Date.now()}_3`,
      name: '事業計画書',
      requiredType: 'required',
      reason: '補助事業の目的・内容・効果を審査するため',
      sourceReference: '公募要項 第5章 審査項目',
      status: 'not_started',
      priority: 'high',
      dueDate: '',
      assignee: '未定',
      memo: '',
      createdBy: 'ai',
      updatedAt: now,
    },
    {
      id: `doc_${Date.now()}_4`,
      name: '会社概要（パンフレット等）',
      requiredType: 'optional',
      reason: '事業内容の補足説明として推奨されるため',
      sourceReference: '公募要項 補足資料一覧',
      status: 'not_started',
      priority: 'low',
      dueDate: '',
      assignee: '未定',
      memo: '',
      createdBy: 'ai',
      updatedAt: now,
    },
    {
      id: `doc_${Date.now()}_5`,
      name: '履歴事項全部証明書',
      requiredType: 'required',
      reason: '法人の実在性確認のため（発行から3ヶ月以内）',
      sourceReference: '公募要項 第3章 提出書類について',
      status: 'not_started',
      priority: 'medium',
      dueDate: '',
      assignee: '未定',
      memo: '',
      createdBy: 'ai',
      updatedAt: now,
    },
    {
      id: `doc_${Date.now()}_6`,
      name: 'gBizID プライム アカウント',
      requiredType: 'required',
      reason: '電子申請システム（jGrants）での申請に必須なため',
      sourceReference: '公募要項 第1章 申請方法',
      status: 'not_started',
      priority: 'high',
      dueDate: '',
      assignee: '未定',
      memo: '',
      createdBy: 'ai',
      updatedAt: now,
    },
    {
      id: `doc_${Date.now()}_7`,
      name: '納税証明書',
      requiredType: 'required',
      reason: '税金の未納がないことの証明のため',
      sourceReference: '公募要項 第3章 提出書類について',
      status: 'not_started',
      priority: 'medium',
      dueDate: '',
      assignee: '未定',
      memo: '',
      createdBy: 'ai',
      updatedAt: now,
    }
  ];

  return documents;
}
