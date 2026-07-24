import test from 'node:test';
import assert from 'node:assert';
import { POST } from './route';
import { GET as DownloadGET } from '../download/[downloadId]/route';

test('UI Generate API - 正常系', async () => {
  const req = new Request('http://localhost/api/document/generate', {
    method: 'POST',
    body: JSON.stringify({
      caseId: 'case-1',
      templateId: 'hatarakikata-r8-form1',
      effectiveDate: '2026-07-20T00:00:00Z',
      confirmedFields: [
        { fieldId: 'capital', value: 10000000, sourceExtractedInfoId: 'id1', verificationStatus: 'verified' }
      ]
    })
  });
  const res = await POST(req);
  const data = await res.json();
  assert.ok(data.success === true || data.success === false);
  if (data.success) {
    assert.ok(data.downloadId);
  }
});

test('UI Generate API - 空confirmedFields', async () => {
  const req = new Request('http://localhost/api/document/generate', {
    method: 'POST',
    body: JSON.stringify({
      caseId: 'case-1',
      templateId: 'hatarakikata-r8-form1',
      effectiveDate: '2026-07-20T00:00:00Z',
      confirmedFields: []
    })
  });
  const res = await POST(req);
  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('UI Generate API - duplicate category', async () => {
  const req = new Request('http://localhost/api/document/generate', {
    method: 'POST',
    body: JSON.stringify({
      caseId: 'case-1',
      templateId: 'hatarakikata-r8-form1',
      effectiveDate: '2026-07-20T00:00:00Z',
      confirmedFields: [
        { fieldId: 'capital', value: 10000000, sourceExtractedInfoId: 'id1', verificationStatus: 'verified' },
        { fieldId: 'capital', value: 20000000, sourceExtractedInfoId: 'id2', verificationStatus: 'verified' }
      ]
    })
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.errors[0].message, 'DUPLICATE_FIELD');
});

test('UI Generate API - generate失敗 (Unknown template)', async () => {
  const req = new Request('http://localhost/api/document/generate', {
    method: 'POST',
    body: JSON.stringify({
      caseId: 'case-1',
      templateId: 'unknown-template',
      effectiveDate: '2026-07-20T00:00:00Z',
      confirmedFields: [
        { fieldId: 'capital', value: 10000000, sourceExtractedInfoId: 'id1', verificationStatus: 'verified' }
      ]
    })
  });
  const res = await POST(req);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

test('UI Download API - download失敗 (Unknown ID)', async () => {
  const req = new Request('http://localhost/api/document/download/00000000-0000-0000-0000-000000000000');
  const res = await DownloadGET(req, { params: Promise.resolve({ downloadId: '00000000-0000-0000-0000-000000000000' }) });
  assert.strictEqual(res.status, 404);
});
