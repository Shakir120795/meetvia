import type { Metadata } from 'next';
import CompanionsBrowser from './CompanionsBrowser';

export const metadata: Metadata = {
  title: 'Find a Companion | MeetVia',
  description: 'Browse local MeetVia companions by name, city and interests.',
};

export default function CompanionsPage() {
  return <CompanionsBrowser />;
}
