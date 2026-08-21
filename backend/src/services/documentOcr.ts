export type OcrField = 'fullName' | 'dateOfBirth' | 'documentNumber' | 'expiryDate' | 'nationality';

export interface OcrResult {
  provider: string;
  confidence: number;
  fields: Partial<Record<OcrField, string>>;
  rawText?: string;
}

export interface OcrProvider {
  extract(input: Buffer, mimeType: string): Promise<OcrResult>;
}

/**
 * Provider-agnostic OCR boundary. Real OCR providers can be plugged in
 * without changing verification or risk-scoring business logic.
 */
export async function extractDocumentText(
  input: Buffer,
  mimeType: string,
  provider: OcrProvider,
): Promise<OcrResult> {
  if (!Buffer.isBuffer(input) || input.length === 0) {
    throw new Error('DOCUMENT_INPUT_REQUIRED');
  }
  if (!mimeType || !mimeType.startsWith('image/')) {
    throw new Error('UNSUPPORTED_DOCUMENT_TYPE');
  }

  const result = await provider.extract(input, mimeType);
  const confidence = Math.max(0, Math.min(100, Number(result.confidence) || 0));

  return {
    provider: result.provider,
    confidence,
    fields: result.fields || {},
    rawText: result.rawText,
  };
}
