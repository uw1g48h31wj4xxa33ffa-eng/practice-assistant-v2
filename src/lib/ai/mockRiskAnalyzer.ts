import { RiskItem } from '@/types';

export const generateMockRiskItems = async (): Promise<RiskItem[]> => {
  // 数秒の遅延は入れない（即時生成）
  
  return [
    {
      id: `risk_${Date.now()}_1`,
      title: '未払い残業代リスク',
      category: '賃金・労働時間',
      summary: '固定残業代の要件を満たしていない可能性があり、過去に遡及して未払い残業代を請求されるリスク。',
      riskLevel: 'high',
      likelihood: 'medium',
      impact: 'high',
      status: 'unchecked',
      countermeasure: '固定残業代の明確な区分と就業規則の改訂、労働時間の適正な管理。',
      sourceReference: '賃金規程・タイムカード',
      memo: '早急な対応が必要',
      createdBy: 'ai',
      updatedAt: new Date().toISOString()
    },
    {
      id: `risk_${Date.now()}_2`,
      title: '解雇・退職トラブルリスク',
      category: '退職・解雇',
      summary: '解雇事由の記載が曖昧であり、不当解雇として争われた場合に敗訴するリスク。',
      riskLevel: 'high',
      likelihood: 'low',
      impact: 'high',
      status: 'unchecked',
      countermeasure: '就業規則の解雇事由の明確化、および退職勧奨のプロセス整備。',
      sourceReference: '就業規則 第XX条',
      memo: '',
      createdBy: 'ai',
      updatedAt: new Date().toISOString()
    },
    {
      id: `risk_${Date.now()}_3`,
      title: 'ハラスメント対応リスク',
      category: '職場環境',
      summary: 'パワハラ防止法に基づく相談窓口の設置や周知が不十分であり、行政指導の対象となるリスク。',
      riskLevel: 'medium',
      likelihood: 'high',
      impact: 'medium',
      status: 'unchecked',
      countermeasure: 'ハラスメント防止規程の作成と、社内・社外相談窓口の明確な設置・周知。',
      sourceReference: 'ヒアリングメモ',
      memo: '優先して窓口を設置',
      createdBy: 'ai',
      updatedAt: new Date().toISOString()
    },
    {
      id: `risk_${Date.now()}_4`,
      title: '就業規則との不整合リスク',
      category: '規程整備',
      summary: '実態としての運用（例：テレワーク等）が就業規則に規定されておらず、労使トラブルに発展するリスク。',
      riskLevel: 'medium',
      likelihood: 'high',
      impact: 'low',
      status: 'unchecked',
      countermeasure: 'テレワーク規程の作成と本則への紐付け。',
      sourceReference: '就業規則・ヒアリングメモ',
      memo: '',
      createdBy: 'ai',
      updatedAt: new Date().toISOString()
    },
    {
      id: `risk_${Date.now()}_5`,
      title: '雇用契約書との不整合リスク',
      category: '規程整備',
      summary: '就業規則の規定と個別の雇用契約書の労働条件が異なっており、有利な条件が適用されることによる予期せぬコストリスク。',
      riskLevel: 'high',
      likelihood: 'medium',
      impact: 'medium',
      status: 'unchecked',
      countermeasure: '雇用契約書のフォーマット見直しと、就業規則への統合。',
      sourceReference: '雇用契約書（雛形）',
      memo: '',
      createdBy: 'ai',
      updatedAt: new Date().toISOString()
    },
    {
      id: `risk_${Date.now()}_6`,
      title: '証拠資料不足リスク',
      category: '労務管理',
      summary: '労働時間や休日の取得状況を客観的に記録する資料（タイムカード等）が存在せず、紛争時に不利になるリスク。',
      riskLevel: 'low',
      likelihood: 'low',
      impact: 'high',
      status: 'unchecked',
      countermeasure: 'クラウド勤怠管理システムの導入検討。',
      sourceReference: '関連資料（未提出）',
      memo: 'システム導入の提案を行う',
      createdBy: 'ai',
      updatedAt: new Date().toISOString()
    },
    {
      id: `risk_${Date.now()}_7`,
      title: '行政指導・是正勧告リスク',
      category: '法令遵守',
      summary: '36協定の届出漏れや法定労働時間超えの常態化による、労働基準監督署からの是正勧告リスク。',
      riskLevel: 'high',
      likelihood: 'high',
      impact: 'medium',
      status: 'unchecked',
      countermeasure: '36協定の即時締結・届出および、残業時間のモニタリング実施。',
      sourceReference: '36協定（未提出）',
      memo: '',
      createdBy: 'ai',
      updatedAt: new Date().toISOString()
    },
    {
      id: `risk_${Date.now()}_8`,
      title: '紛争化リスク',
      category: '紛争',
      summary: '退職予定者との間で既にトラブルの火種があり、労働審判等に発展するリスク。',
      riskLevel: 'low',
      likelihood: 'medium',
      impact: 'high',
      status: 'unchecked',
      countermeasure: '退職合意書の締結による円満解決の模索。',
      sourceReference: 'ヒアリングメモ',
      memo: '個別相談にて対応方針を決定',
      createdBy: 'ai',
      updatedAt: new Date().toISOString()
    }
  ];
};
