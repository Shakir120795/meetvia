export interface QrDetectionResult {
  detected: boolean;
  payloads: string[];
  confidence: number;
  risk: 'NONE' | 'REVIEW' | 'BLOCK';
}

export interface QrDetector {
  detect(input: Buffer, mimeType: string): Promise<QrDetectionResult>;
}

function classify(payloads: string[]): QrDetectionResult['risk'] {
  if (!payloads.length) return 'NONE';
  const contactPattern = /(https?:\/\/|www\.|wa\.me|whatsapp|telegram|instagram|facebook|t\.me|x\.com|twitter)/i;
  return payloads.some((payload) => contactPattern.test(payload)) ? 'BLOCK' : 'REVIEW';
}

export async function detectQrCodes(
  input: Buffer,
  mimeType: string,
  detector: QrDetector,
): Promise<QrDetectionResult> {
  if (!Buffer.isBuffer(input) || input.length === 0) throw new Error('IMAGE_INPUT_REQUIRED');
  if (!mimeType.startsWith('image/')) throw new Error('UNSUPPORTED_IMAGE_TYPE');

  const result = await detector.detect(input, mimeType);
  const payloads = Array.from(new Set((result.payloads || []).filter(Boolean)));
  const confidence = Math.max(0, Math.min(100, Number(result.confidence) || 0));

  return {
    detected: payloads.length > 0,
    payloads,
    confidence,
    risk: classify(payloads),
  };
}
