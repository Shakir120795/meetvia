export interface CompatibilityProfile {
  interests: string[];
  languages: string[];
  destinations: string[];
  travelStyle?: string;
  communicationStyle?: string;
  pace?: 'RELAXED' | 'BALANCED' | 'FAST';
  budgetLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CompatibilityResult {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  breakdown: {
    interests: number;
    languages: number;
    destination: number;
    travelStyle: number;
    communicationStyle: number;
    pace: number;
    budget: number;
  };
  reasons: string[];
}

const overlapRatio = (a: string[], b: string[]) => {
  if (!a.length || !b.length) return 0;
  const set = new Set(b.map((v) => v.trim().toLowerCase()));
  return a.filter((v) => set.has(v.trim().toLowerCase())).length / Math.max(a.length, b.length);
};

export function calculateCompatibility(a: CompatibilityProfile, b: CompatibilityProfile): CompatibilityResult {
  const breakdown = {
    interests: Math.round(overlapRatio(a.interests, b.interests) * 100),
    languages: Math.round(overlapRatio(a.languages, b.languages) * 100),
    destination: Math.round(overlapRatio(a.destinations, b.destinations) * 100),
    travelStyle: a.travelStyle && b.travelStyle && a.travelStyle.toLowerCase() === b.travelStyle.toLowerCase() ? 100 : 0,
    communicationStyle: a.communicationStyle && b.communicationStyle && a.communicationStyle.toLowerCase() === b.communicationStyle.toLowerCase() ? 100 : 0,
    pace: a.pace && b.pace && a.pace === b.pace ? 100 : 0,
    budget: a.budgetLevel && b.budgetLevel && a.budgetLevel === b.budgetLevel ? 100 : 0,
  };

  const score = Math.round(
    breakdown.interests * 0.25 +
    breakdown.languages * 0.10 +
    breakdown.destination * 0.15 +
    breakdown.travelStyle * 0.15 +
    breakdown.communicationStyle * 0.10 +
    breakdown.pace * 0.125 +
    breakdown.budget * 0.075,
  );

  const reasons: string[] = [];
  if (breakdown.interests >= 50) reasons.push('SHARED_INTERESTS');
  if (breakdown.languages >= 50) reasons.push('SHARED_LANGUAGES');
  if (breakdown.destination >= 50) reasons.push('SHARED_DESTINATIONS');
  if (breakdown.travelStyle === 100) reasons.push('TRAVEL_STYLE_MATCH');
  if (breakdown.pace === 100) reasons.push('PACE_MATCH');
  if (breakdown.budget === 100) reasons.push('BUDGET_MATCH');

  return {
    score,
    level: score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW',
    breakdown,
    reasons,
  };
}
