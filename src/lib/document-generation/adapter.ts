/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Case, ExtractedInfo } from '@/types';

export class DocumentInputAdapter {
  /**
   * ExtractedItemがエクスポート可能な確認済み状態か判定する。
   */
  static isExportableExtractedInfo(item: ExtractedInfo | undefined | null): boolean {
    if (!item) return false;
    if (item.status !== 'verified' && item.status !== 'modified') return false;
    
    // Check for empty values
    if (item.content === null || item.content === undefined) return false;
    if (typeof item.content === 'string' && item.content.trim() === '') return false;

    return true;
  }

  /**
   * Practice Assistant V2のCaseデータから、Word Document Engineが期待する
   * 確認済み入力値のMap（record）を生成する。
   */
  static extractVerifiedInputs(caseData: Case): Record<string, any> {
    const inputs: Record<string, any> = {};
    
    if (!caseData.extractedItems) {
      return inputs;
    }

    const exportableItems = caseData.extractedItems.filter(this.isExportableExtractedInfo);

    for (const item of exportableItems) {
      let value: any = item.content;
      
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) || typeof parsed === 'object') {
            value = parsed;
          }
        } catch {
          // パース失敗時は文字列としてそのまま扱う
        }
      }
      
      inputs[item.id] = value;
    }

    return inputs;
  }
}
