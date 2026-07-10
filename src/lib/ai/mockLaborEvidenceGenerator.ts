import { Case, EvidenceItem } from "@/types";

export function buildLaborEvidenceItems(caseData: Case): EvidenceItem[] {
  const items: EvidenceItem[] = [];
  const now = new Date().toISOString();

  // 1. 事実関係と論点の整合確認 (issueItemsを参照)
  const issueCount = caseData.issueItems?.length || 0;
  items.push({
    id: `ev_labor_${Date.now()}_1`,
    title: "事実関係と論点の整合確認",
    category: "risk",
    status: "unchecked",
    summary: `洗い出された論点（計${issueCount}件）と、ヒアリングで確認した事実関係に矛盾や飛躍がないか確認してください。`,
    sourceReference: "論点整理",
    riskLevel: "high",
    createdBy: "ai",
    updatedAt: now
  });

  // 2. 関連資料の不足確認 (requiredDocumentsを参照)
  const requiredCount = caseData.requiredDocuments?.filter(d => d.requiredType === 'required').length || 0;
  const receivedCount = caseData.requiredDocuments?.filter(d => d.requiredType === 'required' && d.status === 'received').length || 0;
  
  items.push({
    id: `ev_labor_${Date.now()}_2`,
    title: "関連資料の不足確認",
    category: "document",
    status: requiredCount > 0 && requiredCount === receivedCount ? "unchecked" : "unchecked",
    summary: `必要資料（計${requiredCount}件）のうち、受領済または不要となっているか確認します。現在、受領済は${receivedCount}件です。`,
    sourceReference: "必要資料一覧",
    riskLevel: "high",
    createdBy: "ai",
    updatedAt: now
  });

  // 3. 労務リスクと対応方針の整合確認 (riskItems, actionPlanItemsを参照)
  const riskCount = caseData.riskItems?.length || 0;
  const actionCount = caseData.actionPlanItems?.length || 0;
  items.push({
    id: `ev_labor_${Date.now()}_3`,
    title: "労務リスクと対応方針の整合確認",
    category: "risk",
    status: "unchecked",
    summary: `特定された労務リスク（${riskCount}件）に対して、対応方針（${actionCount}件）が妥当であり、法的な逸脱がないか確認してください。`,
    sourceReference: "リスク分析・対応方針",
    riskLevel: "high",
    createdBy: "ai",
    updatedAt: now
  });

  // 4. 就業規則・雇用契約書との不整合確認
  items.push({
    id: `ev_labor_${Date.now()}_4`,
    title: "就業規則・雇用契約書との不整合確認",
    category: "guideline",
    status: "unchecked",
    summary: "現在の会社の就業規則や該当社員の雇用契約書の内容と、実際の運用に乖離がないか確認してください。",
    sourceReference: "就業規則・雇用契約書",
    riskLevel: "medium",
    createdBy: "ai",
    updatedAt: now
  });

  // 5. 記録・証拠資料の不足確認 (sourceDocumentsを参照)
  const sourceCount = caseData.sourceDocuments?.length || 0;
  items.push({
    id: `ev_labor_${Date.now()}_5`,
    title: "記録・証拠資料の不足確認",
    category: "source",
    status: sourceCount > 0 ? "unchecked" : "unchecked",
    summary: `主張を裏付ける客観的な記録や証拠資料（現在${sourceCount}件登録）が十分に揃っているか、不足がないか確認してください。`,
    sourceReference: "登録資料一覧",
    riskLevel: "medium",
    createdBy: "ai",
    updatedAt: now
  });

  // 6. 専門家確認が必要な事項
  items.push({
    id: `ev_labor_${Date.now()}_6`,
    title: "専門家確認が必要な事項",
    category: "guideline",
    status: "unchecked",
    summary: "弁護士等、他の専門家の見解や事前確認が必要な高度な法的判断事項が含まれていないか確認してください。",
    sourceReference: "対応方針",
    riskLevel: "medium",
    createdBy: "ai",
    updatedAt: now
  });

  return items;
}
