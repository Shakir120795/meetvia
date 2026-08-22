'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ICity } from '@/types';
import { publicPost } from '@/lib/api';

const companionFormSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required').max(100, 'Full Name must be at most 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  mobile: z.string().min(1, 'Mobile Number is required').regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  city: z.string().min(1, 'City is required'),
  experience: z.string().min(1, 'Experience description is required').max(1000, 'Experience must be at most 1000 characters'),
  whyJoin: z.string().min(1, 'Why join reason is required').max(1000, 'Why join must be at most 1000 characters'),
});

type CompanionFormData = z.infer<typeof companionFormSchema>;

interface CompanionFormProps { cities: ICity[]; }

export default function CompanionForm({ cities }: CompanionFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CompanionFormData>({ resolver: zodResolver(companionFormSchema) });

  const onSubmit = async (data: CompanionFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await publicPost('/api/v1/public/companion-application', data);
      setIsSubmitted(true);
    } catch {
      setServerError('Your application could not be submitted at this time. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12 px-6 bg-white/5 border border-white/10 rounded-theme">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-primary mb-2">Application Submitted!</h3>
        <p className="text-primary/70 max-w-md mx-auto">Thank you for your interest in joining MeetVia. We will review your application and get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-theme" role="alert"><AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" /><p className="text-sm text-red-400">{serverError}</p></div>}
      <Input label="Full Name" placeholder="Enter your full name" error={errors.fullName?.message} register={register('fullName')} maxLength={100} />
      <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} register={register('email')} />
      <Input label="Mobile Number" type="tel" placeholder="9876543210" error={errors.mobile?.message} register={register('mobile')} maxLength={10} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="city" className="text-sm font-medium text-foreground/80">City</label>
        <select id="city" className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors duration-200 appearance-none" aria-invalid={!!errors.city} aria-describedby={errors.city ? 'city-error' : undefined} defaultValue="" {...register('city')}>
          <option value="" disabled className="bg-secondary text-foreground">Select your city</option>
          {cities.map((city) => <option key={city.id} value={city.cityName} className="bg-secondary text-foreground">{city.cityName}, {city.state}</option>)}
        </select>
        {errors.city && <p id="city-error" className="text-sm text-red-500" role="alert">{errors.city.message}</p>}
        {cities.length === 0 && <p className="text-xs text-foreground/50">No active cities are available yet.</p>}
      </div>

      <Input label="Experience" as="textarea" placeholder="Describe your relevant experience (e.g., tourism, hospitality, customer service)" error={errors.experience?.message} register={register('experience')} maxLength={1000} />
      <Input label="Why do you want to join Meetvia?" as="textarea" placeholder="Tell us why you'd like to become a companion on MeetVia" error={errors.whyJoin?.message} register={register('whyJoin')} maxLength={1000} />

      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-theme"><p className="text-sm text-yellow-200/90"><strong>Safety Notice:</strong> MeetVia is a professional public companionship platform. All meetings are conducted in public places only. Background verification is mandatory for all companions.</p></div>
      <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Application'}</Button>
    </form>
  );
}
