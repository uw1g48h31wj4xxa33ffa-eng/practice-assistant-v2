import { Case, EvidenceItem } from "@/types";

export function buildRulesEvidenceItems(caseData: Case): EvidenceItem[] {
  const items: EvidenceItem[] = [];
  const now = new Date().toISOString();

  // 1. 現行規程と改訂案の整合確認 (extractedItems等を参照)
  const extractedCount = caseData.extractedItems?.length || 0;
  items.push({
    id: `ev_rules_${Date.now()}_1`,
    title: "現行規程と改訂案の整合確認",
    category: "guideline",
    status: "unchecked",
    summary: `ヒアリング等で抽出された課題（計${extractedCount}件）が、改訂案に漏れなく反映され、現行規程と矛盾していないか確認してください。`,
    sourceReference: "AI抽出結果・改訂案",
    riskLevel: "high",
    createdBy: "ai",
    updatedAt: now
  });

  // 2. 法令上の必須記載事項の確認
  items.push({
    id: `ev_rules_${Date.now()}_2`,
    title: "法令上の必須記載事項の確認",
    category: "risk",
    status: "unchecked",
    summary: "労働基準法に基づく絶対的必要記載事項および相対的必要記載事項に漏れがないか確認してください。",
    sourceReference: "就業規則案",
    riskLevel: "high",
    createdBy: "ai",
    updatedAt: now
  });

  // 3. 就業規則と賃金規程の整合確認
  items.push({
    id: `ev_rules_${Date.now()}_3`,
    title: "就業規則と賃金規程の整合確認",
    category: "guideline",
    status: "unchecked",
    summary: "就業規則本則と、賃金規程や育児介護休業規程など、別規程との間に矛盾や重複がないか確認してください。",
    sourceReference: "就業規則本則・各種規程",
    riskLevel: "medium",
    createdBy: "ai",
    updatedAt: now
  });

  // 4. 雇用契約書・労働条件通知書との整合確認 (requiredDocuments等を参照)
  items.push({
    id: `ev_rules_${Date.now()}_4`,
    title: "雇用契約書・労働条件通知書との整合確認",
    category: "document",
    status: "unchecked",
    summary: "改訂後の規程内容と、既存および今後発行する雇用契約書・労働条件通知書の記載内容に不整合が生じないか確認してください。",
    sourceReference: "雇用契約書フォーマット",
    riskLevel: "high",
    createdBy: "ai",
    updatedAt: now
  });

  // 5. 条文間の矛盾・重複確認
  items.push({
    id: `ev_rules_${Date.now()}_5`,
    title: "条文間の矛盾・重複確認",
    category: "guideline",
    status: "unchecked",
    summary: "規程全体を通して、条文の参照間違いや、用語の不統一、矛盾・重複規定がないか確認してください。",
    sourceReference: "就業規則案全体",
    riskLevel: "medium",
    createdBy: "ai",
    updatedAt: now
  });

  // 6. 施行日・経過措置の確認
  items.push({
    id: `ev_rules_${Date.now()}_6`,
    title: "施行日・経過措置の確認",
    category: "schedule",
    status: "unchecked",
    summary: "改訂後の規程の施行日が適切か、また、不利益変更等に伴う経過措置の規定が必要かつ十分か確認してください。",
    sourceReference: "附則・施行日",
    riskLevel: "high",
    createdBy: "ai",
    updatedAt: now
  });

  // 7. 専門家最終確認が必要な事項
  items.push({
    id: `ev_rules_${Date.now()}_7`,
    title: "専門家最終確認が必要な事項",
    category: "risk",
    status: "unchecked",
    summary: "高度な法解釈を伴う条文変更や、労働基準監督署への届出にあたり、最終的な法的確認が必要な項目がないか確認してください。",
    sourceReference: "全体",
    riskLevel: "medium",
    createdBy: "ai",
    updatedAt: now
  });

  return items;
}
