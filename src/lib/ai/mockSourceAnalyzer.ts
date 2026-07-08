import { SourceDocument, ExtractedInfo } from '@/types';

export function buildMockExtractedItemsFromSources(
  sourceDocuments: SourceDocument[]
): ExtractedInfo[] {
  if (!sourceDocuments || sourceDocuments.length === 0) {
    return [];
  }

  // 最初のドキュメント情報を元にsourceReferenceを生成
  const doc = sourceDocuments[0];
  let sourceRef = '不明な資料';
  if (doc.sourceType === 'url' && doc.url) {
    sourceRef = doc.url;
  } else if (doc.sourceType === 'pdf' && doc.fileName) {
    sourceRef = doc.fileName;
  } else if (doc.sourceType === 'text') {
    sourceRef = 'テキスト入力';
  } else if (doc.title) {
    sourceRef = doc.title;
  }

  const timestamp = Date.now();

  const items: ExtractedInfo[] = [
    { id: `mock_g1_${timestamp}`, category: '補助金名', content: '（モック）IT導入補助金2024 通常枠', sourceReference: sourceRef, status: 'unverified', aiConfidence: 'high' },
    { id: `mock_g2_${timestamp}`, category: '公募期間', content: '（モック）2024年4月1日 〜 2024年5月31日', sourceReference: sourceRef, status: 'unverified', aiConfidence: 'high' },
    { id: `mock_g3_${timestamp}`, category: '申請締切', content: '（モック）2024年5月31日 17:00 必着', sourceReference: sourceRef, status: 'unverified', aiConfidence: 'high' },
    { id: `mock_g4_${timestamp}`, category: '対象事業', content: '（モック）生産性向上に資するITツールの導入', sourceReference: sourceRef, status: 'unverified', aiConfidence: 'medium' },
    { id: `mock_g5_${timestamp}`, category: '対象経費', content: '（モック）ソフトウェア購入費、クラウド利用費（最大2年分）', sourceReference: sourceRef, status: 'unverified', aiConfidence: 'high' },
    { id: `mock_g6_${timestamp}`, category: '補助率', content: '（モック）1/2 以内', sourceReference: sourceRef, status: 'unverified', aiConfidence: 'high' },
    { id: `mock_g7_${timestamp}`, category: '補助上限額', content: '（モック）最大 150万円', sourceReference: sourceRef, status: 'unverified', aiConfidence: 'medium' },
    { id: `mock_g8_${timestamp}`, category: '申請方法', content: '（モック）jGrantsによる電子申請のみ', sourceReference: sourceRef, status: 'unverified', aiConfidence: 'high' },
    { id: `mock_g9_${timestamp}`, category: '提出先', content: '（モック）IT導入支援事業事務局', sourceReference: sourceRef, status: 'unverified', aiConfidence: 'high' },
    { id: `mock_g10_${timestamp}`, category: '注意事項', content: '（モック）gBizIDプライムアカウントの事前取得が必須', sourceReference: sourceRef, status: 'unverified', aiConfidence: 'high' }
  ];

  return items;
}
