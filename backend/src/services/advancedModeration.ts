export type ModerationCategory =
  | 'SAFE'
  | 'HARASSMENT'
  | 'HATE'
  | 'SEXUAL'
  | 'VIOLENCE'
  | 'SCAM'
  | 'OFF_PLATFORM_CONTACT'
  | 'SPAM';

export type ModerationAction = 'ALLOW' | 'REVIEW' | 'BLOCK';

export interface ModerationResult {
  action: ModerationAction;
  score: number;
  categories: ModerationCategory[];
  reasons: string[];
}

const RULES: Array<{ category: Exclude<ModerationCategory, 'SAFE'>; weight: number; patterns: RegExp[] }> = [
  { category: 'HARASSMENT', weight: 70, patterns: [/\b(kill yourself|kys|i will hurt you)\b/i] },
  { category: 'HATE', weight: 85, patterns: [/\b(all .* should die|racial slur)\b/i] },
  { category: 'SEXUAL', weight: 75, patterns: [/\b(explicit sex|nude pics?|send nudes)\b/i] },
  { category: 'VIOLENCE', weight: 85, patterns: [/\b(bomb|shoot you|stab you|murder)\b/i] },
  { category: 'SCAM', weight: 80, patterns: [/\b(send (me )?money|investment guaranteed|double your money|otp code)\b/i] },
  { category: 'OFF_PLATFORM_CONTACT', weight: 55, patterns: [/\b(whatsapp|telegram|signal)\b/i] },
  { category: 'SPAM', weight: 45, patterns: [/(.)\1{8,}/, /\b(click here|limited offer|buy now)\b/i] },
];

export function moderateContent(input: string): ModerationResult {
  const text = String(input || '').trim();
  if (!text) return { action: 'REVIEW', score: 50, categories: ['SPAM'], reasons: ['EMPTY_CONTENT'] };

  const categories: ModerationCategory[] = [];
  const reasons: string[] = [];
  let score = 0;

  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      categories.push(rule.category);
      score = Math.max(score, rule.weight);
      reasons.push(`${rule.category}_SIGNAL`);
    }
  }

  if (categories.length === 0) {
    return { action: 'ALLOW', score: 0, categories: ['SAFE'], reasons: [] };
  }

  const action: ModerationAction = score >= 80 ? 'BLOCK' : score >= 50 ? 'REVIEW' : 'ALLOW';
  return { action, score: Math.min(100, score), categories, reasons };
}
