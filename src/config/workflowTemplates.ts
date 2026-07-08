export interface WorkflowStep {
  id: string;
  title: string;
  shortDescription?: string;
  description: string;
  href?: string;
  order: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  applicableCaseTypes: string[];
  steps: WorkflowStep[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "labor_rules_v1",
    name: "規程設計・労務系",
    description: "就業規則などの規程作成・改訂や一般的な労務相談に対応する標準的な業務フロー",
    keywords: ["就業規則", "賃金規程", "育児介護休業", "労務相談", "規程設計", "改訂"],
    applicableCaseTypes: ["就業規則改訂", "賃金規程", "育児介護休業規程", "労務相談", "税務相談", "その他"],
    steps: [
      { id: 'hearing', title: '1. ヒアリング', description: '現状確認・要望ヒアリングの実施', href: '/cases/[id]/hearing', order: 1 },
      { id: 'rule_design', title: '2. 規程設計', description: 'プロンプト生成とドラフト作成', href: '/cases/[id]/rule-design', order: 2 },
      { id: 'ai_review', title: '3. AI検証・エビデンス', description: '法改正・整合性チェック', href: '/cases/[id]/ai-evidence', order: 3 },
      { id: 'delivery_prep', title: '4. 納品', shortDescription: '納品前の最終確認と共有準備', description: '最終確認、提出資料、納品前チェック、専門家確認、顧問先への共有準備を行う工程。', href: '/cases/[id]/delivery', order: 4 },
    ]
  },
  {
    id: "subsidy_v1",
    name: "補助金支援",
    description: "補助金制度の調査、公募要項整理、必要資料整理、進捗管理、提出準備を行う業務フロー",
    keywords: ["補助金", "公募", "申請", "事業計画", "採択", "交付申請"],
    applicableCaseTypes: ["補助金支援", "補助金制度調査", "公募要項・要網整理", "補助金申請準備", "補助金進捗管理"],
    steps: [
      { id: 'hearing', title: '1. ヒアリング', description: '補助金制度に関する情報収集・データ整理', href: '/cases/[id]/hearing', order: 1 },
      { id: 'guideline_review', title: '2. 公募要項整理', shortDescription: '公開情報・申請条件・期限を確認', description: '公開情報や公募要項を読み取り、対象制度、申請条件、対象経費、期限、提出方法などを確認する工程。', href: '/cases/[id]/subsidy-guideline', order: 2 },
      { id: 'document_prep', title: '3. 必要資料整理', shortDescription: '申請に必要な資料を整理', description: '申請に必要な資料・データを整理する工程。会社情報、事業計画、見積書、決算資料、添付書類などを確認する。', href: '/cases/[id]/required-documents', order: 3 },
      { id: 'schedule_management', title: '4. スケジュール管理', shortDescription: '締切・確認日・提出準備を管理', description: '公募締切、社内確認、資料回収、提出準備などのスケジュールを管理する工程。', href: '/cases/[id]/subsidy-schedule', order: 4 },
      { id: 'ai_review', title: '5. AI検証・エビデンス', description: '社内外関係者との連絡・確認業務', href: '/cases/[id]/ai-evidence', order: 5 },
      { id: 'delivery_prep', title: '6. 納品・提出準備', shortDescription: '提出前の最終確認と共有準備', description: '提出前の最終確認、必要資料の確認、提出先・提出方法・期限の確認、控え資料の整理、関係者への共有準備を行う工程。', href: '/cases/[id]/subsidy-delivery', order: 6 },
    ]
  }
];

export function getWorkflowTemplateById(templateId?: string): WorkflowTemplate | undefined {
  if (!templateId) return undefined;
  return workflowTemplates.find(t => t.id === templateId);
}

export function getWorkflowTemplateByCaseType(caseType: string): WorkflowTemplate | undefined {
  return workflowTemplates.find(t => t.applicableCaseTypes.includes(caseType));
}

export function getDefaultWorkflowTemplate(): WorkflowTemplate {
  return workflowTemplates[0]; // fallback to labor_rules_v1
}
