import { ConfirmedDocumentFieldDTO } from '../dto';

type ExtractedInfoToDocumentFieldMapping = {
  extractedCategory: string;
  documentFieldId: string;
  transform?: (value: unknown) => unknown;
};

const HATARAKIKATA_MAPPINGS: ExtractedInfoToDocumentFieldMapping[] = [
  { extractedCategory: 'plan_start_date', documentFieldId: 'plan_start_date' },
  { extractedCategory: 'capital', documentFieldId: 'capital' },
  { extractedCategory: 'employee_count', documentFieldId: 'employee_count' },
  { extractedCategory: 'corporate_number', documentFieldId: 'corporate_number' },
  { extractedCategory: 'labor_insurance_number', documentFieldId: 'labor_insurance_number' },
  { extractedCategory: 'bank_name', documentFieldId: 'bank_name' },
  { extractedCategory: 'branch_name', documentFieldId: 'branch_name' },
  { extractedCategory: 'bank_account_number', documentFieldId: 'bank_account_number' },
  { extractedCategory: 'bank_account_holder', documentFieldId: 'bank_account_holder' },
  { extractedCategory: 'bank_account_type', documentFieldId: 'bank_account_type' },
  { extractedCategory: 'cooperate_checkbox', documentFieldId: 'cooperate_checkbox' },
  { extractedCategory: 'field_16', documentFieldId: 'field_16' },
  // sdt_group_14 requires an array of strings in Word engine
  { 
    extractedCategory: 'sdt_group_14', 
    documentFieldId: 'sdt_group_14',
    transform: (val) => Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',').map(s => s.trim()) : val)
  }
];

export function mapHatarakikataFields(confirmedFields: ConfirmedDocumentFieldDTO[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const field of confirmedFields) {
    // Phase 4 minimal implementation: the UI is sending ExtractedInfo.category as field.fieldId for now,
    // or we treat the provided fieldId as the category. 
    // Wait, the instruction says: UI side will send confirmedFields where fieldId is derived from explicit mapping.
    // Let's assume the UI sends extracted category as `sourceExtractedInfoId` and mapped field as `fieldId`.
    // The instruction says: "category等から明示Mappingする. mapping未定義項目は自動接続しない".
    
    // In our DTO, ConfirmedDocumentFieldDTO has `fieldId`. 
    // We can map it directly if the DTO already contains the mapped fieldId.
    // However, to satisfy "一致しない項目は自動接続しない" and explicit mapping, 
    // we should apply the mapping here, or validate it here.
    // Let's validate it against HATARAKIKATA_MAPPINGS.
    const mapping = HATARAKIKATA_MAPPINGS.find(m => m.documentFieldId === field.fieldId);
    if (!mapping) {
      // mapping未定義項目は自動接続しない -> スキップ
      continue;
    }

    let val: unknown = field.value;
    if (mapping.transform) {
      val = mapping.transform(val);
    }
    result[mapping.documentFieldId] = val;
  }

  return result;
}

export { HATARAKIKATA_MAPPINGS };
