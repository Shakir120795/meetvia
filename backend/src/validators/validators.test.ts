import { loginSchema } from './auth';
import { updateThemeSchema } from './theme';
import { createHeroSlideSchema } from './heroSlide';
import { createServiceSchema } from './service';
import { createFaqSchema } from './faq';
import { createTestimonialSchema } from './testimonial';
import { createCitySchema } from './city';
import { submitContactSchema } from './contact';
import { submitCompanionSchema } from './companion';
import { updateLegalPageSchema } from './legalPage';
import { createSocialLinkSchema } from './socialLink';
import { updateSiteSettingsSchema } from './siteSettings';
import { updateHowItWorksSchema } from './howItWorks';

describe('Auth Validator', () => {
  it('should pass with valid email and password', () => {
    const { error } = loginSchema.validate({ email: 'test@example.com', password: 'pass123' });
    expect(error).toBeUndefined();
  });

  it('should fail with invalid email', () => {
    const { error } = loginSchema.validate({ email: 'invalid', password: 'pass123' });
    expect(error).toBeDefined();
  });

  it('should fail with empty password', () => {
    const { error } = loginSchema.validate({ email: 'test@example.com', password: '' });
    expect(error).toBeDefined();
  });

  it('should fail with missing email', () => {
    const { error } = loginSchema.validate({ password: 'pass123' });
    expect(error).toBeDefined();
  });
});

describe('Theme Validator', () => {
  const validTheme = {
    primaryColor: '#FFFFFF',
    secondaryColor: '#0A1628',
    accentColor: '#00D4FF',
    backgroundColor: '#0A1628',
    textColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 12,
    glassmorphismIntensity: 50,
    activePreset: 'futuristic-blue',
  };

  it('should pass with valid theme data', () => {
    const { error } = updateThemeSchema.validate(validTheme);
    expect(error).toBeUndefined();
  });

  it('should fail with invalid hex color', () => {
    const { error } = updateThemeSchema.validate({ ...validTheme, primaryColor: 'red' });
    expect(error).toBeDefined();
    expect(error!.details[0].message).toContain('hex color');
  });

  it('should fail with 3-char hex shorthand', () => {
    const { error } = updateThemeSchema.validate({ ...validTheme, accentColor: '#FFF' });
    expect(error).toBeDefined();
  });

  it('should fail with borderRadius > 32', () => {
    const { error } = updateThemeSchema.validate({ ...validTheme, borderRadius: 33 });
    expect(error).toBeDefined();
  });

  it('should fail with glassmorphismIntensity > 100', () => {
    const { error } = updateThemeSchema.validate({ ...validTheme, glassmorphismIntensity: 101 });
    expect(error).toBeDefined();
  });

  it('should fail with invalid preset', () => {
    const { error } = updateThemeSchema.validate({ ...validTheme, activePreset: 'invalid' });
    expect(error).toBeDefined();
  });
});

describe('HeroSlide Validator', () => {
  it('should pass with valid data', () => {
    const { error } = createHeroSlideSchema.validate({ heading: 'Test heading' });
    expect(error).toBeUndefined();
  });

  it('should fail with heading exceeding 200 chars', () => {
    const { error } = createHeroSlideSchema.validate({ heading: 'a'.repeat(201) });
    expect(error).toBeDefined();
  });

  it('should fail without heading', () => {
    const { error } = createHeroSlideSchema.validate({ subtitle: 'test' });
    expect(error).toBeDefined();
  });

  it('should validate overlayOpacity range', () => {
    const { error } = createHeroSlideSchema.validate({ heading: 'Test', overlayOpacity: 101 });
    expect(error).toBeDefined();
  });
});

describe('Service Validator', () => {
  const validService = {
    title: 'City Exploration',
    description: 'A guided city tour',
    locationType: 'Public',
  };

  it('should pass with valid data', () => {
    const { error } = createServiceSchema.validate(validService);
    expect(error).toBeUndefined();
  });

  it('should fail without required fields', () => {
    const { error } = createServiceSchema.validate({});
    expect(error).toBeDefined();
  });

  it('should fail with invalid locationType', () => {
    const { error } = createServiceSchema.validate({ ...validService, locationType: 'Private' });
    expect(error).toBeDefined();
  });

  it('should fail with title exceeding 100 chars', () => {
    const { error } = createServiceSchema.validate({ ...validService, title: 'a'.repeat(101) });
    expect(error).toBeDefined();
  });
});

describe('FAQ Validator', () => {
  it('should pass with valid data', () => {
    const { error } = createFaqSchema.validate({ question: 'What?', answer: 'Something.' });
    expect(error).toBeUndefined();
  });

  it('should fail without question', () => {
    const { error } = createFaqSchema.validate({ answer: 'Something.' });
    expect(error).toBeDefined();
  });

  it('should fail without answer', () => {
    const { error } = createFaqSchema.validate({ question: 'What?' });
    expect(error).toBeDefined();
  });
});

describe('Testimonial Validator', () => {
  const valid = { reviewerName: 'Jane', reviewText: 'Great service!' };

  it('should pass with valid data', () => {
    const { error } = createTestimonialSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('should fail with rating outside 1-5', () => {
    const { error } = createTestimonialSchema.validate({ ...valid, rating: 6 });
    expect(error).toBeDefined();
  });

  it('should fail with rating below 1', () => {
    const { error } = createTestimonialSchema.validate({ ...valid, rating: 0 });
    expect(error).toBeDefined();
  });
});

describe('City Validator', () => {
  const valid = { cityName: 'Agra', state: 'Uttar Pradesh', country: 'India' };

  it('should pass with valid data', () => {
    const { error } = createCitySchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('should fail without cityName', () => {
    const { error } = createCitySchema.validate({ state: 'UP', country: 'India' });
    expect(error).toBeDefined();
  });

  it('should fail with invalid status', () => {
    const { error } = createCitySchema.validate({ ...valid, status: 'deleted' });
    expect(error).toBeDefined();
  });
});

describe('Contact Validator', () => {
  const valid = {
    fullName: 'John Doe',
    email: 'john@example.com',
    serviceType: 'City Exploration',
    message: 'I would like to book',
    safetyConfirmed: true,
  };

  it('should pass with valid data', () => {
    const { error } = submitContactSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('should fail when safetyConfirmed is false', () => {
    const { error } = submitContactSchema.validate({ ...valid, safetyConfirmed: false });
    expect(error).toBeDefined();
  });

  it('should fail with invalid email', () => {
    const { error } = submitContactSchema.validate({ ...valid, email: 'notanemail' });
    expect(error).toBeDefined();
  });

  it('should pass with optional mobile', () => {
    const { error } = submitContactSchema.validate({ ...valid, mobile: '+91 9876543210' });
    expect(error).toBeUndefined();
  });

  it('should fail with message exceeding 2000 chars', () => {
    const { error } = submitContactSchema.validate({ ...valid, message: 'x'.repeat(2001) });
    expect(error).toBeDefined();
  });
});

describe('Companion Validator', () => {
  const valid = {
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    mobile: '9876543210',
    city: 'Agra',
    experience: 'I have 2 years of experience',
    whyJoin: 'I want to help tourists',
  };

  it('should pass with valid data', () => {
    const { error } = submitCompanionSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('should fail with non-Indian mobile (starts with 5)', () => {
    const { error } = submitCompanionSchema.validate({ ...valid, mobile: '5876543210' });
    expect(error).toBeDefined();
  });

  it('should fail with mobile less than 10 digits', () => {
    const { error } = submitCompanionSchema.validate({ ...valid, mobile: '98765432' });
    expect(error).toBeDefined();
  });

  it('should fail with mobile more than 10 digits', () => {
    const { error } = submitCompanionSchema.validate({ ...valid, mobile: '98765432101' });
    expect(error).toBeDefined();
  });

  it('should pass with mobile starting with 6, 7, 8, or 9', () => {
    for (const start of ['6', '7', '8', '9']) {
      const { error } = submitCompanionSchema.validate({ ...valid, mobile: `${start}123456789` });
      expect(error).toBeUndefined();
    }
  });
});

describe('LegalPage Validator', () => {
  it('should pass with valid data', () => {
    const { error } = updateLegalPageSchema.validate({ title: 'Privacy Policy', content: 'Content here' });
    expect(error).toBeUndefined();
  });

  it('should fail without title', () => {
    const { error } = updateLegalPageSchema.validate({ content: 'Content here' });
    expect(error).toBeDefined();
  });

  it('should fail with content exceeding 100000 chars', () => {
    const { error } = updateLegalPageSchema.validate({ title: 'Test', content: 'x'.repeat(100001) });
    expect(error).toBeDefined();
  });
});

describe('SocialLink Validator', () => {
  const valid = {
    platform: 'Instagram',
    url: 'https://instagram.com/meetvia',
    iconIdentifier: 'instagram',
  };

  it('should pass with valid data', () => {
    const { error } = createSocialLinkSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('should fail with invalid URL', () => {
    const { error } = createSocialLinkSchema.validate({ ...valid, url: 'not-a-url' });
    expect(error).toBeDefined();
  });

  it('should fail without URL', () => {
    const { error } = createSocialLinkSchema.validate({ platform: 'Instagram', iconIdentifier: 'ig' });
    expect(error).toBeDefined();
  });
});

describe('SiteSettings Validator', () => {
  const valid = {
    siteName: 'Meetvia',
    metaTitle: 'Meetvia',
  };

  it('should pass with valid data', () => {
    const { error } = updateSiteSettingsSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('should fail without siteName', () => {
    const { error } = updateSiteSettingsSchema.validate({ metaTitle: 'Meetvia' });
    expect(error).toBeDefined();
  });

  it('should fail with metaTitle exceeding 60 chars', () => {
    const { error } = updateSiteSettingsSchema.validate({ ...valid, metaTitle: 'x'.repeat(61) });
    expect(error).toBeDefined();
  });

  it('should fail with invalid contactEmail', () => {
    const { error } = updateSiteSettingsSchema.validate({ ...valid, contactEmail: 'not-email' });
    expect(error).toBeDefined();
  });
});

describe('HowItWorks Validator', () => {
  const validSteps = {
    steps: [
      { stepNumber: 1, title: 'Choose Activity', description: 'Pick an activity' },
      { stepNumber: 2, title: 'Confirm Meeting', description: 'Confirm the meeting point' },
    ],
  };

  it('should pass with valid steps', () => {
    const { error } = updateHowItWorksSchema.validate(validSteps);
    expect(error).toBeUndefined();
  });

  it('should fail with more than 10 steps', () => {
    const steps = Array.from({ length: 11 }, (_, i) => ({
      stepNumber: i + 1,
      title: `Step ${i + 1}`,
      description: 'Description',
    }));
    const { error } = updateHowItWorksSchema.validate({ steps });
    expect(error).toBeDefined();
  });

  it('should fail with step missing title', () => {
    const { error } = updateHowItWorksSchema.validate({
      steps: [{ stepNumber: 1, description: 'Something' }],
    });
    expect(error).toBeDefined();
  });

  it('should fail with step title exceeding 100 chars', () => {
    const { error } = updateHowItWorksSchema.validate({
      steps: [{ stepNumber: 1, title: 'a'.repeat(101), description: 'Something' }],
    });
    expect(error).toBeDefined();
  });
});
