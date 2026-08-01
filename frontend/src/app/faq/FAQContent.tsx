'use client';

import Accordion from '@/components/ui/Accordion';
import { IFAQ } from '@/types';

interface FAQContentProps {
  faqs: IFAQ[];
}

export default function FAQContent({ faqs }: FAQContentProps) {
  const accordionItems = faqs.map((faq) => ({
    id: faq._id,
    title: faq.question,
    content: faq.answer,
  }));

  return <Accordion items={accordionItems} allowMultiple />;
}
