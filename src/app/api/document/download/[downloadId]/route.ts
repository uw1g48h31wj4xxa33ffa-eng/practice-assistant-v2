import { NextResponse } from 'next/server';
import { generatedStore } from '@/lib/document-generation/generated-store';
import { WordGenerationApplicationService } from '@/lib/document-generation/application-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ downloadId: string }> }
) {
  try {
    const { downloadId } = await params;

    if (!downloadId) {
      return NextResponse.json({ error: 'Missing downloadId' }, { status: 400 });
    }

    // path traversal prevention: ensure downloadId is a clean UUID
    if (!/^[0-9a-fA-F-]+$/.test(downloadId)) {
      return NextResponse.json({ error: 'Invalid downloadId format' }, { status: 400 });
    }

    // Try new store first
    let fileInfo;
    try {
      fileInfo = generatedStore.lookup(downloadId);
    } catch (e: unknown) {
      return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 404 });
    }

    // Fallback to legacy store
    if (!fileInfo) {
      fileInfo = WordGenerationApplicationService.getGeneratedBuffer(downloadId);
    }
    
    if (!fileInfo) {
      return NextResponse.json({ error: 'FILE_MISSING' }, { status: 404 });
    }

    return new NextResponse(fileInfo.buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': fileInfo.contentType,
        'Content-Disposition': `attachment; filename="${fileInfo.fileName}"`,
      },
    });
  } catch (error: unknown) {
    console.error('File download failed:', error);
    return NextResponse.json(
      { error: 'File download failed' },
      { status: 500 }
    );
  }
}
