import { ReviewStatus } from "@/components/ui/HumanApprovalBadge";

export type Priority = 'high' | 'medium' | 'low';
export type CaseProgressStatus = 'hearing' | 'rule_design' | 'ai_review' | 'delivery_prep' | 'completed' | 'guideline_review' | 'document_prep' | 'schedule_management';

export interface Case {
  id: string;
  title: string;
  clientName: string;
  caseType: string;
  dueDate: string;
  priority: Priority;
  assignee: string;
  templateId?: string;
  industry?: string;
  employeeCount?: string;
  clientContactPerson?: string;
  reviewStatus: ReviewStatus;
  progressStatus: CaseProgressStatus;
  memo: string;
  createdAt: string;
  extractedItems?: ExtractedInfo[];
  subsidyGuidelineItems?: ExtractedInfo[];
  subsidyDocumentItems?: SubsidyDocumentItem[];
  subsidyScheduleItems?: SubsidyScheduleItem[];
  subsidyDeliveryItems?: SubsidyDeliveryItem[];
  validationRecord?: AIValidationRecord;
}

// Mock Data
export const mockCases: Case[] = [
  {
    id: "1",
    title: "就業規則改訂（育児介護休業法対応）",
    clientName: "A社（匿名）",
    caseType: "就業規則改訂",
    dueDate: "2026-08-31",
    priority: "high",
    assignee: "山田太郎",
    industry: "その他",
    employeeCount: "100〜299名",
    clientContactPerson: "総務部 田中様",
    reviewStatus: "pending_review",
    progressStatus: "rule_design",
    memo: "2026年法改正対応。リモートワーク規程も合わせて見直し。",
    createdAt: "2026-07-01",
  },
  {
    id: "2",
    title: "賃金規程 新規作成",
    clientName: "B株式会社（匿名）",
    caseType: "賃金規程",
    dueDate: "2026-09-15",
    priority: "medium",
    assignee: "佐藤花子",
    industry: "製造業",
    employeeCount: "50〜99名",
    clientContactPerson: "人事 鈴木",
    reviewStatus: "assignee_confirmed",
    progressStatus: "ai_review",
    memo: "ベースアップ対応を含む新制度への移行",
    createdAt: "2026-06-20",
  },
  {
    id: "3",
    title: "ハラスメント防止規程 見直し",
    clientName: "C合同会社（匿名）",
    caseType: "規程改訂",
    dueDate: "2026-07-15",
    priority: "low",
    assignee: "山田太郎",
    industry: "IT・情報通信",
    employeeCount: "10〜29名",
    clientContactPerson: "",
    reviewStatus: "expert_confirmed",
    progressStatus: "delivery_prep",
    memo: "パワハラ防止法対応の最終チェック",
    createdAt: "2026-06-01",
  }
];

export interface AITaskTemplate {
  id: string;
  name: string;
  description: string;
  recommendedCapability: string;
  recommendedProvider: string;
  promptTemplate: string;
  evidenceRequired: boolean;
  humanReviewRequired: boolean;
  expertReviewRequired: boolean;
  recommendedSteps: string[];
}

export const taskTemplates: AITaskTemplate[] = [
  {
    id: 't1',
    name: 'ヒアリング内容を整理する',
    description: '面談やメールのメモから、論点と事実関係を構造化して整理します。',
    recommendedCapability: '文章構造化・要約',
    recommendedProvider: '文章整理・長文整理向きAI',
    promptTemplate: '以下のヒアリングメモから、「事実関係」「課題・論点」「不足している情報」を箇条書きで整理してください。\n\n[ここにメモを入力]',
    evidenceRequired: false,
    humanReviewRequired: true,
    expertReviewRequired: false,
    recommendedSteps: [
      'ヒアリングのメモや文字起こしデータを準備する',
      '個人情報や機密情報がマスキングされているか確認する',
      'AIにプロンプトを投げて整理結果を得る',
      '整理結果と元のメモに齟齬がないか担当者が確認する'
    ]
  },
  {
    id: 't2',
    name: '法改正の根拠を確認する',
    description: '特定のテーマに関する最新の法改正情報や通達、ガイドラインの所在を検索・確認します。',
    recommendedCapability: '最新情報検索・出典提示',
    recommendedProvider: '根拠検索・出典確認向きAI',
    promptTemplate: '以下のテーマに関する最新の法改正、厚生労働省の通達、またはガイドラインを検索し、その出典元URLと概要を教えてください。\nテーマ：[ここにテーマを入力]',
    evidenceRequired: true,
    humanReviewRequired: true,
    expertReviewRequired: true,
    recommendedSteps: [
      '確認したい法改正のテーマを明確にする',
      'AIに検索を依頼する',
      '提示されたURLに実際にアクセスし、一次情報（e-Govや厚労省サイト等）を確認する',
      '検索結果の内容について、専門家（社労士等）のレビューを受ける'
    ]
  },
  {
    id: 't3',
    name: '規程案のたたき台を作る',
    description: '要件をもとに、規程（就業規則など）の初期ドラフトを作成します。',
    recommendedCapability: 'フォーマット生成・法的文章生成',
    recommendedProvider: '汎用文章生成AI',
    promptTemplate: '以下の要件を満たす[規程名]の条文案（第X条〜）を作成してください。\n要件：\n1. \n2. ',
    evidenceRequired: true,
    humanReviewRequired: true,
    expertReviewRequired: true,
    recommendedSteps: [
      '規程に盛り込むべき必須要件・ヒアリング結果を整理する',
      'AIにたたき台の作成を依頼する',
      '生成された条文が日本の現行法規に違反していないか確認する',
      '必ず専門家（社労士）による詳細な内容審査と加筆修正を行う'
    ]
  },
  {
    id: 't4',
    name: '新旧対照表を作る',
    description: '改訂前と改訂後の規程テキストから、変更箇所を明示した新旧対照表を作成します。',
    recommendedCapability: '差分抽出・表計算出力',
    recommendedProvider: '文書整形・Office連携向きツール',
    promptTemplate: '以下の「現行規程」と「改訂案」を比較し、変更がある条文のみを抽出して新旧対照表（Markdown形式またはCSV形式）を作成してください。\n\n【現行規程】\n\n【改訂案】\n',
    evidenceRequired: false,
    humanReviewRequired: true,
    expertReviewRequired: false,
    recommendedSteps: [
      '現行規程と改訂案のテキストを用意する',
      'AIに対照表の作成を依頼する',
      '意図しない変更や抜け漏れがないか、担当者が目視で最終確認する'
    ]
  },
  {
    id: 't5',
    name: 'AI回答の根拠を確認する',
    description: 'AIが生成したテキストや提案の中に、ハルシネーション（もっともらしいウソ）がないか検証します。',
    recommendedCapability: '事実検証（ファクトチェック）',
    recommendedProvider: '根拠検索・出典確認向きAI',
    promptTemplate: '以下の文章に含まれる「法律に関する主張」や「数値」について、その根拠となる公式なソース（政府機関のサイト等）を検索して提示してください。\n\n[検証したい文章]',
    evidenceRequired: true,
    humanReviewRequired: true,
    expertReviewRequired: true,
    recommendedSteps: [
      'ファクトチェックが必要な文章を特定する',
      'AIに根拠の検索を依頼する',
      '提示されたソースが公式な一次情報であるかを人間がアクセスして確認する',
      '専門家による最終判断を行う'
    ]
  },
  {
    id: 't6',
    name: '納品前チェックをする',
    description: '顧客へ提出する前の最終資料について、表記ゆれ、誤字脱字、要件との不一致がないか確認します。',
    recommendedCapability: '校正・ルールベースの照合',
    recommendedProvider: '文章整理・長文整理向きAI',
    promptTemplate: '以下の文書について、「誤字脱字」「敬語の間違い」「表記ゆれ」を指摘してください。修正案も合わせて提示してください。\n\n[文書]',
    evidenceRequired: false,
    humanReviewRequired: true,
    expertReviewRequired: true,
    recommendedSteps: [
      '最終版のドキュメントを用意する',
      'AIに校正を依頼する',
      '指摘された箇所を人間が確認し、必要に応じて手動で修正する',
      '専門家による最終承認を得る'
    ]
  },
  {
    id: 't7',
    name: 'Word提出用の文章に整える',
    description: '整理された箇条書きのメモなどを、顧客向けの丁寧なビジネス文書のトーンに整形します。',
    recommendedCapability: 'トーン＆マナー調整',
    recommendedProvider: '汎用文章生成AI',
    promptTemplate: '以下の箇条書きのメモを、顧問先の社長へ提出する丁寧なビジネス文書（Word等の送付状、または提案書の前文）に書き換えてください。過度にへりくだらず、専門家としての信頼感が伝わるトーンにしてください。\n\n[箇条書きメモ]',
    evidenceRequired: false,
    humanReviewRequired: true,
    expertReviewRequired: false,
    recommendedSteps: [
      'ベースとなる情報を用意する',
      'AIに文章のトーン調整を依頼する',
      '出力された文章のニュアンスが自事務所の意図と合っているか確認・調整する'
    ]
  }
];

export type VerificationStatus = 'unverified' | 'verified' | 'modified' | 'rejected';

export type DocumentPreparationStatus = 'prepared' | 'missing' | 'pending' | 'not_required';

export interface SubsidyDocumentItem {
  id: string;
  documentName: string;
  purpose: string;
  isRequired: boolean;
  preparationStatus: DocumentPreparationStatus;
  status: VerificationStatus;
  aiMemo: string;
  notes?: string;
  rejectReason?: string;
}

export type ScheduleVerificationStatus = 'unverified' | 'verified' | 'modified' | 'rejected';

export type ScheduleProgressStatus = 'not_started' | 'in_progress' | 'done' | 'delayed' | 'at_risk' | 'not_required';

export interface SubsidyScheduleItem {
  id: string;
  title: string;
  dueDate: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  verificationStatus: ScheduleVerificationStatus;
  progressStatus: ScheduleProgressStatus;
  aiMemo: string;
  riskNote?: string;
  notes?: string;
}

export type DeliveryVerificationStatus = 'unverified' | 'verified' | 'modified' | 'rejected';

export type DeliveryCompletionStatus = 'incomplete' | 'completed' | 'issue_found' | 'not_required';

export interface SubsidyDeliveryItem {
  id: string;
  title: string;
  purpose: string;
  importance: 'high' | 'medium' | 'low';
  verificationStatus: DeliveryVerificationStatus;
  completionStatus: DeliveryCompletionStatus;
  aiMemo: string;
  cautionNote?: string;
  notes?: string;
}

export interface ExtractedInfo {
  id: string;
  category: string;
  content: string;
  originalContent?: string;
  sourceReference: string;
  status: VerificationStatus;
  aiConfidence: 'high' | 'medium' | 'low';
  rejectReason?: string;
  statusHistory?: {
    status: VerificationStatus;
    changedAt: string;
    changedBy?: string;
    reason?: string;
  }[];
}

export interface EvidenceItem {
  id: string;
  sourceType: '官公庁' | '法令' | '通達' | 'Q&A' | '裁判例' | '専門団体' | 'その他';
  title: string;
  url: string;
  checkedAt: string;
  summary: string;
  isVerifiedByHuman: boolean;
}

export interface AIValidationRecord {
  promptText: string;
  aiOutput: string;
  evidenceItems: EvidenceItem[];
  staffComment: string;
  expertComment: string;
}
