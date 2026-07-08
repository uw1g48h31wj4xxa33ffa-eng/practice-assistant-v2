import { Case, EvidenceItem } from "@/types";

export function buildMockEvidenceItems(caseData: Case): EvidenceItem[] {
  const items: EvidenceItem[] = [];
  const now = new Date().toISOString();

  // 1. 公募要項の締切とスケジュールが一致しているか
  items.push({
    id: `ev_${Date.now()}_1`,
    title: "公募要項の締切とスケジュールの整合性",
    category: "schedule",
    status: "unchecked",
    summary: "スケジュール上の「提出期限」が公募要項の「締切」と一致しているか確認してください。",
    sourceReference: "公募要項・要綱整理 / スケジュール管理",
    riskLevel: "high",
    createdBy: "ai",
    updatedAt: now
  });

  // 2. 必須資料が不足していないか
  const requiredCount = caseData.requiredDocuments?.filter(d => d.requiredType === 'required').length || 0;
  const receivedCount = caseData.requiredDocuments?.filter(d => d.requiredType === 'required' && d.status === 'received').length || 0;
  
  items.push({
    id: `ev_${Date.now()}_2`,
    title: "必須資料の不足確認",
    category: "document",
    status: requiredCount > 0 && requiredCount === receivedCount ? "unchecked" : "unchecked", // Let user verify it manually
    summary: `必須資料（計${requiredCount}件）のうち、受領済または不要となっているか確認します。現在、受領済は${receivedCount}件です。`,
    sourceReference: "必要資料整理",
    riskLevel: "high",
    createdBy: "ai",
    updatedAt: now
  });

  // 3. gBizIDの取得が必要か
  const needsGBizID = caseData.requiredDocuments?.some(d => d.name.toLowerCase().includes('gbiz')) || false;
  items.push({
    id: `ev_${Date.now()}_3`,
    title: "gBizIDプライムアカウントの準備状況",
    category: "risk",
    status: needsGBizID ? "unchecked" : "not_applicable",
    summary: "電子申請に必要なgBizIDプライムアカウントが取得・有効化されているか確認してください。取得には2〜3週間かかる場合があります。",
    sourceReference: "公募要項",
    riskLevel: needsGBizID ? "high" : "low",
    createdBy: "ai",
    updatedAt: now
  });

  // 4. 見積書・決算書などの資料状態に不足がないか
  items.push({
    id: `ev_${Date.now()}_4`,
    title: "見積書・決算書の有効性確認",
    category: "document",
    status: "unchecked",
    summary: "提出予定の決算書（直近2期分）や相見積書が要件を満たしているか（日付、印鑑、明細等）を確認してください。",
    sourceReference: "必要資料整理",
    riskLevel: "medium",
    createdBy: "ai",
    updatedAt: now
  });

  // 5. 出典URLまたは登録資料が紐づいているか
  const sourceCount = caseData.sourceDocuments?.length || 0;
  items.push({
    id: `ev_${Date.now()}_5`,
    title: "出典・根拠資料の紐付け確認",
    category: "source",
    status: sourceCount > 0 ? "unchecked" : "unchecked",
    summary: `案件に関連する根拠資料（現在${sourceCount}件登録）がすべて正しくアップロード・紐付けられているか確認してください。`,
    sourceReference: "登録資料一覧",
    riskLevel: "medium",
    createdBy: "ai",
    updatedAt: now
  });

  // 6. 納品前に専門家確認が必要な項目があるか
  items.push({
    id: `ev_${Date.now()}_6`,
    title: "専門家（認定支援機関等）の事前確認",
    category: "guideline",
    status: "unchecked",
    summary: "申請にあたり、認定支援機関の確認書や外部専門家の所見が必要な要件がないか確認してください。",
    riskLevel: "medium",
    createdBy: "ai",
    updatedAt: now
  });

  return items;
}
