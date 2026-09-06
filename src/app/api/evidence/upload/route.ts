import { NextResponse } from 'next/server';

import {
  MAX_UPLOAD_BYTES,
  SUPPORTED_EXTENSIONS,
  asSupportingDocument,
  extractDocument,
} from '@/lib/integrations/documents';
import { addSupportingDocument, nextUploadedDocumentId } from '@/lib/store';
import { ensureStoreReady } from '@/lib/store/ensure';

/** What Verity accepts, so the client can say so before a user picks a file. */
export async function GET() {
  await ensureStoreReady();
  return NextResponse.json({
    supportedExtensions: SUPPORTED_EXTENSIONS,
    maxBytes: MAX_UPLOAD_BYTES,
    note: 'Uploads become supporting evidence the agent can cite. Nothing posts, and nothing bypasses a control.',
  });
}

/**
 * Accepts one or more documents, extracts what it can, and registers each as
 * evidence. Extraction is labelled by how it was done — a model read, a
 * deterministic parse, or not at all — so nothing on screen implies more
 * certainty than we have.
 */
export async function POST(request: Request) {
  await ensureStoreReady();
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Send a multipart form with one or more "files".' }, { status: 400 });
  }

  const files = form.getAll('files').filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files were attached.' }, { status: 400 });
  }

  const accepted = [];
  const rejected = [];

  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await extractDocument(file.name, bytes);

    if ('error' in result) {
      rejected.push({ fileName: file.name, reason: result.error });
      continue;
    }

    const document = addSupportingDocument(asSupportingDocument(result, nextUploadedDocumentId()));
    accepted.push({ extraction: result, document });
  }

  return NextResponse.json({
    ok: accepted.length > 0,
    accepted,
    rejected,
    note:
      accepted.length > 0
        ? 'Registered as evidence. The agent can now retrieve these with get_supporting_document, and any claim about them is checked by the evidence-lineage controls.'
        : 'Nothing was registered.',
  });
}
