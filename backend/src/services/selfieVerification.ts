export interface SelfieMatchResult {
  provider: string;
  similarity: number;
  livenessPassed: boolean;
  status: 'VERIFIED' | 'REVIEW' | 'REJECTED';
  reasons: string[];
}

export interface SelfieVerificationProvider {
  verify(selfie: Buffer, referenceDocument: Buffer): Promise<{
    provider: string;
    similarity: number;
    livenessPassed: boolean;
  }>;
}

export async function verifySelfie(
  selfie: Buffer,
  referenceDocument: Buffer,
  provider: SelfieVerificationProvider,
): Promise<SelfieMatchResult> {
  if (!Buffer.isBuffer(selfie) || selfie.length === 0) throw new Error('SELFIE_REQUIRED');
  if (!Buffer.isBuffer(referenceDocument) || referenceDocument.length === 0) throw new Error('REFERENCE_DOCUMENT_REQUIRED');

  const result = await provider.verify(selfie, referenceDocument);
  const similarity = Math.max(0, Math.min(100, Number(result.similarity) || 0));
  const reasons: string[] = [];
  if (!result.livenessPassed) reasons.push('LIVENESS_FAILED');
  if (similarity < 60) reasons.push('LOW_FACE_SIMILARITY');

  const status = !result.livenessPassed || similarity < 40
    ? 'REJECTED'
    : similarity < 80
      ? 'REVIEW'
      : 'VERIFIED';

  return {
    provider: result.provider,
    similarity,
    livenessPassed: result.livenessPassed,
    status,
    reasons,
  };
}
