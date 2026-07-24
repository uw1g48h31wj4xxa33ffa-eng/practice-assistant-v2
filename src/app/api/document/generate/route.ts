import { NextResponse } from 'next/server';
import { WordGenerationApplicationService } from '@/lib/document-generation/application-service';
import { WordGenerationRequestDTO } from '@/lib/document-generation/dto';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Simple distinction between new DTO and legacy caseData
    if (data.confirmedFields && Array.isArray(data.confirmedFields)) {
      // New Phase 4 Path
      const reqDto = data as WordGenerationRequestDTO;

      // Basic validation
      if (!reqDto.caseId) throw new Error('INVALID_REQUEST: caseId empty');
      if (!reqDto.templateId) throw new Error('INVALID_REQUEST: templateId empty');
      if (!reqDto.effectiveDate) throw new Error('INVALID_REQUEST: effectiveDate empty');

      // We only support hatarakikata-r8-form1 currently for the new DTO
      if (reqDto.templateId !== 'hatarakikata-r8-form1') {
        return NextResponse.json(
          { success: false, errors: [{ code: 'INVALID_REQUEST', message: 'UNKNOWN_TEMPLATE', retryable: false }] },
          { status: 400 }
        );
      }

      for (const f of reqDto.confirmedFields) {
        if (!f.fieldId) throw new Error('INVALID_REQUEST: fieldId empty');
        if (!f.sourceExtractedInfoId) throw new Error('INVALID_REQUEST: sourceExtractedInfoId empty');
        if (f.verificationStatus !== 'verified' && f.verificationStatus !== 'modified') {
          throw new Error('INVALID_VERIFICATION_STATUS');
        }
      }

      // Check for duplicates
      const ids = reqDto.confirmedFields.map(f => f.fieldId);
      if (new Set(ids).size !== ids.length) {
        return NextResponse.json(
          { success: false, errors: [{ code: 'INVALID_REQUEST', message: 'DUPLICATE_FIELD', retryable: false }] },
          { status: 400 }
        );
      }

      const result = await WordGenerationApplicationService.generateFromRequest(reqDto);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });

    } else {
      // Legacy Path (Fallback)
      const result = await WordGenerationApplicationService.generateDocument(data, 'hatarakikata-r8-form1');
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
  } catch (error: unknown) {
    console.error('Document generation failed:', error);
    return NextResponse.json(
      {
        success: false,
        errors: [{ code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : String(error), retryable: false }]
      },
      { status: 500 }
    );
  }
}
