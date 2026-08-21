export type RiskSignal = { code: string; weight: number; reason: string };

export type RiskScore = {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  signals: RiskSignal[];
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function calculateRiskScore(signals: RiskSignal[]): RiskScore {
  const normalized = signals.filter((signal) => Number.isFinite(signal.weight)).map((signal) => ({ ...signal, weight: clamp(signal.weight) }));
  const score = clamp(normalized.reduce((sum, signal) => sum + signal.weight, 0));
  const level = score >= 70 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW';
  return { score, level, signals: normalized };
}
