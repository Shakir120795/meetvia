'use client';

import { FormEvent, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ISiteSettings } from '@/types';
import { submitContact } from '@/lib/contactApi';

interface ContactSectionProps { siteSettings: ISiteSettings; }
const inputClass = 'w-full rounded-xl border border-primary/10 bg-white/70 px-4 py-3 text-primary outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/10';

export default function ContactSection({ siteSettings }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const whatsappLink = siteSettings.whatsappNumber ? `https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}${siteSettings.whatsappMessage ? `?text=${encodeURIComponent(siteSettings.whatsappMessage)}` : ''}` : '#';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setSubmitted(false); setError('');
    const form = new FormData(event.currentTarget);
    try {
      await submitContact({ fullName: String(form.get('fullName') || '').trim(), email: String(form.get('email') || '').trim(), mobile: String(form.get('mobile') || '').trim() || undefined, serviceType: String(form.get('serviceType') || '').trim(), preferredDate: String(form.get('preferredDate') || '').trim() || null, message: String(form.get('message') || '').trim(), safetyConfirmed: true });
      event.currentTarget.reset(); setSubmitted(true);
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : 'Unable to submit your inquiry. Please try again.'); }
    finally { setSubmitting(false); }
  }

  return <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8" id="contact">
    <div className="max-w-5xl mx-auto">
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6 }}>
        <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Contact MeetVia</h2>
        <p className="text-primary/70 text-lg max-w-2xl mx-auto">Have a question about finding a companion or joining MeetVia? Send us your details and we&apos;ll get back to you.</p>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-8">
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }} transition={{ duration: 0.5, delay: 0.2 }} className="glass p-6 sm:p-8 rounded-theme space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="text-sm font-medium text-primary">Full name<input name="fullName" required maxLength={100} className={`${inputClass} mt-2`} /></label><label className="text-sm font-medium text-primary">Email<input name="email" type="email" required className={`${inputClass} mt-2`} /></label></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="text-sm font-medium text-primary">Mobile<input name="mobile" type="tel" className={`${inputClass} mt-2`} /></label><label className="text-sm font-medium text-primary">What do you need?<select name="serviceType" required className={`${inputClass} mt-2`} defaultValue=""><option value="" disabled>Select an option</option><option value="companion">Find a companion</option><option value="experience">Experience</option><option value="become-companion">Become a companion</option><option value="general">General inquiry</option></select></label></div>
          <label className="text-sm font-medium text-primary block">Preferred date <span className="font-normal text-primary/50">(optional)</span><input name="preferredDate" type="date" className={`${inputClass} mt-2`} /></label>
          <label className="text-sm font-medium text-primary block">Message<textarea name="message" required maxLength={2000} rows={5} className={`${inputClass} mt-2 resize-y`} /></label>
          <label className="flex items-start gap-3 text-sm text-primary/70"><input type="checkbox" required className="mt-1 h-4 w-4" /><span>I agree that MeetVia may use these details to respond to my inquiry.</span></label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {submitted && <p role="status" className="flex items-center gap-2 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" /> Your inquiry has been submitted successfully.</p>}
          <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Sending…' : 'Send inquiry'}</Button>
        </motion.form>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass p-6 rounded-theme flex flex-col items-center justify-center text-center">
          <MessageCircle className="w-12 h-12 text-green-500 mb-4" aria-hidden="true" /><h3 className="text-xl font-semibold text-primary mb-2">Quick Assistance</h3><p className="text-primary/70 text-sm mb-6">Prefer a direct conversation? Message us on WhatsApp.</p><Button href={whatsappLink} variant="primary" size="md" className="bg-green-600 hover:bg-green-700">Message on WhatsApp</Button>
        </motion.div>
      </div>
    </div>
  </section>;
}
