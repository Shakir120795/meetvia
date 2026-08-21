import { OcrResult } from './documentOcr';

export interface VerificationInput {
  ocr: OcrResult;
  profile: {
    fullName?: string | null;
    dateOfBirth?: string | null;
    nationality?: string | null;
  };
}

export interface VerificationResult {
  status: 'VERIFIED' | 'REVIEW' | 'REJECTED';
  score: number;
  matchedFields: string[];
  mismatchedFields: string[];
  reasons: string[];
}

function normalize(value?: string | null): string {
  return (value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fieldMatch(a?: string | null, b?: string | null): boolean {
  const left = normalize(a);
  const right = normalize(b);
  return !!left && !!right && left === right;
}

export function verifyDocument(input: VerificationInput): VerificationResult {
  const matchedFields: string[] = [];
  const mismatchedFields: string[] = [];
  const reasons: string[] = [];

  const checks: Array<[string, string | undefined | null, string | undefined]> = [
    ['fullName', input.profile.fullName, input.ocr.fields.fullName],
    ['dateOfBirth', input.profile.dateOfBirth, input.ocr.fields.dateOfBirth],
    ['nationality', input.profile.nationality, input.ocr.fields.nationality],
  ];

  for (const [field, profileValue, documentValue] of checks) {
    if (!documentValue) continue;
    if (fieldMatch(profileValue, documentValue)) matchedFields.push(field);
    else mismatchedFields.push(field);
  }

  let score = input.ocr.confidence;
  score += matchedFields.length * 10;
  score -= mismatchedFields.length * 25;
  score = Math.max(0, Math.min(100, score));

  if (mismatchedFields.length > 0) reasons.push('PROFILE_DOCUMENT_MISMATCH');
  if (input.ocr.confidence < 60) reasons.push('LOW_OCR_CONFIDENCE');
  if (!input.ocr.fields.fullName) reasons.push('NAME_NOT_EXTRACTED');

  const status = mismatchedFields.length >= 2 || score < 40
    ? 'REJECTED'
    : score < 75 || reasons.length > 0
      ? 'REVIEW'
      : 'VERIFIED';

  return { status, score, matchedFields, mismatchedFields, reasons };
}
