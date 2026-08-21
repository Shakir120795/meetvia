export type FraudLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FraudSignal {
  code: string;
  weight: number;
  reason: string;
}

export interface FraudInput {
  accountAgeDays?: number;
  failedOtpAttempts?: number;
  rapidAccountChanges?: number;
  repeatedPaymentFailures?: number;
  duplicateDocumentHash?: boolean;
  suspiciousIp?: boolean;
  deviceAccountCount?: number;
}

export interface FraudResult {
  score: number;
  level: FraudLevel;
  signals: FraudSignal[];
}

export function detectFraud(input: FraudInput): FraudResult {
  const signals: FraudSignal[] = [];
  const add = (code: string, weight: number, reason: string) => signals.push({ code, weight, reason });

  if ((input.accountAgeDays ?? 999) < 1) add('NEW_ACCOUNT', 10, 'Account is less than one day old');
  if ((input.failedOtpAttempts ?? 0) >= 5) add('OTP_ABUSE', 20, 'Repeated OTP failures detected');
  if ((input.rapidAccountChanges ?? 0) >= 3) add('RAPID_ACCOUNT_CHANGES', 15, 'Multiple profile/account changes detected');
  if ((input.repeatedPaymentFailures ?? 0) >= 3) add('PAYMENT_FAILURE_PATTERN', 20, 'Repeated payment failures detected');
  if (input.duplicateDocumentHash) add('DUPLICATE_DOCUMENT', 35, 'Document fingerprint is already associated with another account');
  if (input.suspiciousIp) add('SUSPICIOUS_IP', 15, 'IP reputation indicates elevated risk');
  if ((input.deviceAccountCount ?? 0) >= 4) add('MULTI_ACCOUNT_DEVICE', 20, 'Multiple accounts are associated with the same device');

  const score = Math.min(100, signals.reduce((sum, signal) => sum + signal.weight, 0));
  const level: FraudLevel = score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';

  return { score, level, signals };
}
