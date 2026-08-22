'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ISiteSettings, IService } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { MessageCircle, CheckCircle } from 'lucide-react';

const contactSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required').max(100, 'Maximum 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  mobile: z.string().optional().refine((value) => !value || /^[+]?\d[\d\s()\-]{6,19}$/.test(value), 'Please enter a valid phone number'),
  serviceType: z.string().min(1, 'Please select a type of service'),
  preferredDate: z.string().optional(),
  message: z.string().min(1, 'Message is required').max(2000, 'Maximum 2000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;
interface ContactFormProps { siteSettings: ISiteSettings; services: IService[]; }

export default function ContactForm({ siteSettings, services }: ContactFormProps) {
  const [safetyChecked, setSafetyChecked] = useState(false);
  const [safetyError, setSafetyError] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    if (!safetyChecked) { setSafetyError('You must confirm the safety acknowledgment to proceed.'); return; }
    setSafetyError(''); setIsSubmitting(true); setServerError('');
    try {
      const payload = { ...data, preferredDate: data.preferredDate || undefined, mobile: data.mobile || undefined, safetyConfirmed: true };
      const response = await fetch('/api/v1/public/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        setServerError(errorData?.error?.message || 'Something went wrong. Please try again.');
        setSubmitStatus('error'); return;
      }
      setSubmitStatus('success'); reset(); setSafetyChecked(false);
    } catch {
      setServerError('Unable to submit your inquiry. Please try again later.'); setSubmitStatus('error');
    } finally { setIsSubmitting(false); }
  };

  const whatsappLink = siteSettings.whatsappNumber ? `https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}${siteSettings.whatsappMessage ? `?text=${encodeURIComponent(siteSettings.whatsappMessage)}` : ''}` : '#';

  if (submitStatus === 'success') return (
    <div className="glass p-8 text-center space-y-6">
      <div className="flex justify-center"><CheckCircle className="w-16 h-16 text-green-400" /></div>
      <h3 className="text-2xl font-bold text-foreground">Thank you for your inquiry!</h3>
      <p className="text-foreground/70">We have received your message and will get back to you shortly. You can also continue the conversation on WhatsApp for quicker assistance.</p>
      {siteSettings.whatsappNumber && <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-theme transition-colors duration-200"><MessageCircle className="w-5 h-5" /> Continue on WhatsApp</a>}
      <div><button type="button" onClick={() => setSubmitStatus('idle')} className="text-accent hover:underline text-sm mt-4">Submit another inquiry</button></div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass p-6 md:p-8 space-y-5" noValidate>
      <h3 className="text-xl font-bold text-foreground mb-2">Send us a Message</h3>
      {submitStatus === 'error' && serverError && <div className="bg-red-500/10 border border-red-500/30 rounded-theme px-4 py-3 text-red-400 text-sm" role="alert">{serverError}</div>}
      <Input label="Full Name *" placeholder="Enter your full name" error={errors.fullName?.message} register={register('fullName')} />
      <Input label="Email *" type="email" placeholder="Enter your email address" error={errors.email?.message} register={register('email')} />
      <Input label="Mobile Number" type="tel" placeholder="Enter your mobile number (optional)" error={errors.mobile?.message} register={register('mobile')} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="serviceType" className="text-sm font-medium text-foreground/80">Type of Service *</label>
        <select id="serviceType" className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors duration-200" aria-invalid={!!errors.serviceType} aria-describedby={errors.serviceType ? 'serviceType-error' : undefined} {...register('serviceType')}>
          <option value="" className="bg-secondary text-foreground">Select a service</option>
          {services.map((service) => <option key={service.id} value={service.title} className="bg-secondary text-foreground">{service.title}</option>)}
        </select>
        {errors.serviceType && <p id="serviceType-error" className="text-sm text-red-500" role="alert">{errors.serviceType.message}</p>}
        {services.length === 0 && <p className="text-xs text-foreground/50">Service options are temporarily unavailable.</p>}
      </div>
      <div className="flex flex-col gap-1.5"><label htmlFor="preferredDate" className="text-sm font-medium text-foreground/80">Preferred Date</label><input id="preferredDate" type="date" min={new Date().toISOString().slice(0, 10)} className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors duration-200" {...register('preferredDate')} /></div>
      <Input label="Message *" as="textarea" placeholder="Tell us how we can help you (max 2000 characters)" error={errors.message?.message} register={register('message')} />
      <div className="space-y-1.5"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={safetyChecked} onChange={(e) => { setSafetyChecked(e.target.checked); if (e.target.checked) setSafetyError(''); }} className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50 flex-shrink-0" /><span className="text-sm text-foreground/70">{siteSettings.safetyCheckboxText || 'I confirm that I understand MeetVia provides public-only companionship and city assistance services. All meetings occur in public places.'}</span></label>{safetyError && <p className="text-sm text-red-500 ml-7" role="alert">{safetyError}</p>}</div>
      <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full">{isSubmitting ? 'Submitting...' : 'Submit Inquiry'}</Button>
    </form>
  );
}
