export interface RecommendationCandidate {
  id: string;
  type: 'COMPANION' | 'TRIP' | 'EXPERIENCE';
  title: string;
  destination?: string;
  interests?: string[];
  languages?: string[];
  travelStyle?: string;
  verified?: boolean;
  safetyScore?: number;
}

export interface RecommendationProfile {
  interests: string[];
  languages: string[];
  destinations: string[];
  travelStyle?: string;
}

export interface RecommendationResult extends RecommendationCandidate {
  score: number;
  reasons: string[];
}

const overlap = (a: string[] = [], b: string[] = []) => {
  const target = new Set(b.map((v) => v.trim().toLowerCase()).filter(Boolean));
  return a.filter((v) => target.has(v.trim().toLowerCase())).length;
};

export function recommend(
  profile: RecommendationProfile,
  candidates: RecommendationCandidate[],
): RecommendationResult[] {
  return candidates.map((candidate) => {
    let score = 0;
    const reasons: string[] = [];
    const interests = overlap(profile.interests, candidate.interests);
    const languages = overlap(profile.languages, candidate.languages);
    const destinations = overlap(profile.destinations, candidate.destination ? [candidate.destination] : []);

    score += Math.min(35, interests * 10);
    score += Math.min(20, languages * 10);
    score += destinations ? 20 : 0;

    if (profile.travelStyle && candidate.travelStyle && profile.travelStyle.toLowerCase() === candidate.travelStyle.toLowerCase()) {
      score += 15;
      reasons.push('TRAVEL_STYLE_MATCH');
    }
    if (candidate.verified) {
      score += 5;
      reasons.push('VERIFIED');
    }
    if (typeof candidate.safetyScore === 'number') score += Math.min(5, Math.max(0, candidate.safetyScore / 20));
    if (interests) reasons.push('INTEREST_MATCH');
    if (languages) reasons.push('LANGUAGE_MATCH');
    if (destinations) reasons.push('DESTINATION_MATCH');

    return { ...candidate, score: Math.max(0, Math.min(100, score)), reasons };
  }).sort((a, b) => b.score - a.score);
}
