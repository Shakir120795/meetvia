export interface TripPlannerInput {
  destination: string;
  startDate: string;
  endDate: string;
  interests?: string[];
  travelStyle?: string;
  budgetMinor?: number;
  currency?: string;
}

export interface PlannedDay {
  day: number;
  date: string;
  activities: string[];
}

export interface TripPlan {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelStyle?: string;
  budgetMinor?: number;
  currency: string;
  days: PlannedDay[];
}

function dateOnly(value: string): Date {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error('INVALID_DATE');
  return date;
}

export function createTripPlan(input: TripPlannerInput): TripPlan {
  if (!input.destination?.trim()) throw new Error('DESTINATION_REQUIRED');
  const start = dateOnly(input.startDate);
  const end = dateOnly(input.endDate);
  const durationDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  if (durationDays < 1) throw new Error('INVALID_TRIP_RANGE');
  if (durationDays > 60) throw new Error('TRIP_TOO_LONG');

  const interests = (input.interests || []).filter(Boolean).slice(0, 8);
  const days: PlannedDay[] = [];
  for (let index = 0; index < durationDays; index += 1) {
    const date = new Date(start.getTime() + index * 86400000).toISOString().slice(0, 10);
    const activities = [
      index === 0 ? `Arrive in ${input.destination}` : `Explore ${input.destination}`,
      ...interests.slice(0, 2).map((interest) => `${interest} activity`),
      index === durationDays - 1 ? `Departure from ${input.destination}` : 'Free time / local exploration',
    ];
    days.push({ day: index + 1, date, activities });
  }

  return {
    destination: input.destination.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    durationDays,
    travelStyle: input.travelStyle,
    budgetMinor: input.budgetMinor,
    currency: input.currency || 'INR',
    days,
  };
}
