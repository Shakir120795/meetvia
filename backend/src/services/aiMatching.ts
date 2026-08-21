export interface MatchingProfile {
  userId: string;
  interests: string[];
  languages: string[];
  travelStyles: string[];
  destinations: string[];
  availability?: Array<{ startAt: Date; endAt: Date }>;
}

export interface MatchCandidate extends MatchingProfile {
  verificationScore?: number;
  safetyScore?: number;
}

export interface MatchResult {
  userId: string;
  score: number;
  reasons: string[];
}

const overlap = (left: string[], right: string[]): number => {
  const a = new Set(left.map((v) => v.trim().toLowerCase()).filter(Boolean));
  const b = new Set(right.map((v) => v.trim().toLowerCase()).filter(Boolean));
  if (!a.size || !b.size) return 0;
  let matches = 0;
  for (const value of a) if (b.has(value)) matches += 1;
  return matches / Math.max(a.size, b.size);
};

export function rankCompanionMatches(
  requester: MatchingProfile,
  candidates: MatchCandidate[],
  limit = 20,
): MatchResult[] {
  return candidates
    .filter((candidate) => candidate.userId !== requester.userId)
    .map((candidate) => {
      const interest = overlap(requester.interests, candidate.interests);
      const language = overlap(requester.languages, candidate.languages);
      const style = overlap(requester.travelStyles, candidate.travelStyles);
      const destination = overlap(requester.destinations, candidate.destinations);
      const verification = Math.max(0, Math.min(100, candidate.verificationScore ?? 0)) / 100;
      const safety = Math.max(0, Math.min(100, candidate.safetyScore ?? 0)) / 100;

      const score = Math.round(
        (interest * 30 + language * 15 + style * 15 + destination * 20 + verification * 10 + safety * 10) * 100,
      ) / 100;

      const reasons: string[] = [];
      if (interest > 0) reasons.push('SHARED_INTERESTS');
      if (language > 0) reasons.push('SHARED_LANGUAGES');
      if (style > 0) reasons.push('COMPATIBLE_TRAVEL_STYLE');
      if (destination > 0) reasons.push('SHARED_DESTINATION');
      if (verification >= 0.8) reasons.push('HIGH_VERIFICATION');
      if (safety >= 0.8) reasons.push('HIGH_SAFETY');

      return { userId: candidate.userId, score: Math.min(100, score), reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(100, limit)));
}
