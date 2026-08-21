export interface DiscoveryItem {
  id: string;
  type: 'COMPANION' | 'TRIP' | 'EXPERIENCE';
  title: string;
  destination?: string;
  interests?: string[];
  languages?: string[];
  travelStyle?: string;
  verified?: boolean;
  safetyScore?: number;
  popularity?: number;
}

export interface DiscoveryProfile {
  interests: string[];
  languages: string[];
  destinations: string[];
  travelStyle?: string;
}

export interface PersonalizedItem extends DiscoveryItem {
  score: number;
  reasons: string[];
}

const matches = (wanted: string[], actual: string[] = []) => {
  const set = new Set(actual.map((v) => v.toLowerCase().trim()));
  return wanted.filter((v) => set.has(v.toLowerCase().trim())).length;
};

export function personalizeDiscovery(profile: DiscoveryProfile, items: DiscoveryItem[]): PersonalizedItem[] {
  return items.map((item) => {
    let score = 0;
    const reasons: string[] = [];
    const interestMatches = matches(profile.interests, item.interests);
    const languageMatches = matches(profile.languages, item.languages);
    const destinationMatches = profile.destinations.some((d) => d.toLowerCase().trim() === (item.destination || '').toLowerCase().trim());

    score += Math.min(35, interestMatches * 10);
    score += Math.min(20, languageMatches * 10);
    if (destinationMatches) { score += 20; reasons.push('DESTINATION_MATCH'); }
    if (profile.travelStyle && item.travelStyle && profile.travelStyle.toLowerCase() === item.travelStyle.toLowerCase()) {
      score += 15;
      reasons.push('TRAVEL_STYLE_MATCH');
    }
    if (item.verified) { score += 5; reasons.push('VERIFIED'); }
    if (typeof item.safetyScore === 'number') score += Math.min(5, Math.max(0, item.safetyScore / 20));
    if (interestMatches) reasons.push('INTEREST_MATCH');
    if (languageMatches) reasons.push('LANGUAGE_MATCH');
    if ((item.popularity || 0) > 70) reasons.push('POPULAR');

    return { ...item, score: Math.max(0, Math.min(100, score)), reasons };
  }).sort((a, b) => b.score - a.score);
}
