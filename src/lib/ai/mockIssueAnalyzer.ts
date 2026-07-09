import { IssueItem } from '@/types';

/**
 * 労務相談のヒアリング情報から論点候補をモック生成する
 * 本来は入力データ（Caseデータや抽出結果）をLLM APIに送信し、JSONで返却させる想定
 */
export async function generateMockIssueItems(): Promise<IssueItem[]> {
  // 擬似的な通信遅延
  await new Promise(resolve => setTimeout(resolve, 1500));

  return [
    {
      id: `issue_${Date.now()}_1`,
      title: '労働時間・残業代の未払いリスク',
      category: '労働時間・残業代',
      summary: 'タイムカードの記録と実際の退社時間に乖離がある可能性が示唆されています。',
      status: 'unchecked',
      riskLevel: 'high',
      sourceReference: 'ヒアリングメモ',
      memo: '',
      createdBy: 'ai',
      updatedAt: new Date().toISOString(),
    },
    {
      id: `issue_${Date.now()}_2`,
      title: '休職手続きの不備',
      category: '休職・退職・解雇',
      summary: '休職に関する診断書の提出タイミングと、復職判断の基準について規程が曖昧です。',
      status: 'unchecked',
      riskLevel: 'medium',
      sourceReference: '就業規則（現行）',
      memo: '',
      createdBy: 'ai',
      updatedAt: new Date().toISOString(),
    },
    {
      id: `issue_${Date.now()}_3`,
      title: 'パワハラ防止体制の未整備',
      category: 'ハラスメント',
      summary: '相談窓口は設置されているものの、実質的に機能していない（相談しにくい）という意見があります。',
      status: 'unchecked',
      riskLevel: 'high',
      sourceReference: 'ヒアリングメモ',
      memo: '',
      createdBy: 'ai',
      updatedAt: new Date().toISOString(),
    },
    {
      id: `issue_${Date.now()}_4`,
      title: '雇用契約書と実態の相違',
      category: '雇用契約書との整合',
      summary: '一部のパート社員について、契約更新のプロセスが適切に行われていない可能性があります。',
      status: 'unchecked',
      riskLevel: 'medium',
      sourceReference: '雇用契約書サンプル',
      memo: '',
      createdBy: 'ai',
      updatedAt: new Date().toISOString(),
    }
  ];
}
