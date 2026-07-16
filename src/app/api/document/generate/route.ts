import { NextResponse } from 'next/server';
import { WordGenerationApplicationService } from '@/lib/document-generation/application-service';

export async function POST(request: Request) {
  try {
    const caseData = await request.json();
    
    // Application ServiceでWord文書を生成し、DTOを受け取る
    // デモ用として templateId は固定
    const result = await WordGenerationApplicationService.generateDocument(caseData, 'hatarakikata-r8-form1');
    
    // 生成した文書の結果DTOをクライアントに返す
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error('Document generation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        errors: ['Document generation failed', error.message] 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const downloadId = searchParams.get('downloadId');

    if (!downloadId) {
      return NextResponse.json({ error: 'Missing downloadId' }, { status: 400 });
    }

    const fileInfo = WordGenerationApplicationService.getGeneratedBuffer(downloadId);
    
    if (!fileInfo) {
      return NextResponse.json({ error: 'File not found or expired' }, { status: 404 });
    }

    return new NextResponse(fileInfo.buffer as any, {
      status: 200,
      headers: {
        'Content-Type': fileInfo.contentType,
        'Content-Disposition': `attachment; filename="${fileInfo.fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('File download failed:', error);
    return NextResponse.json(
      { error: 'File download failed' },
      { status: 500 }
    );
  }
}
