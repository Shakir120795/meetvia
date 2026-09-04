import prisma from './db';
import { hashPassword } from '../utils/password';
import { seedAuthData } from './seedAuth';

async function seedAdminUser(): Promise<void> {
  const count = await prisma.adminUser.count();
  if (count > 0) {
    console.log('  ⏭  AdminUser table already has data, skipping...');
    return;
  }

  const hashedPassword = await hashPassword('ChangeMe123!');
  await prisma.adminUser.create({
    data: {
      email: 'admin@meetvia.com',
      password: hashedPassword,
      name: 'Admin',
    },
  });
  console.log('  ✅ Default admin user seeded');
}

async function seedThemeSettings(): Promise<void> {
  const count = await prisma.themeSettings.count();
  if (count > 0) {
    console.log('  ⏭  ThemeSettings table already has data, skipping...');
    return;
  }

  await prisma.themeSettings.create({
    data: {
      activePreset: 'futuristic_blue',
      primaryColor: '#FFFFFF',
      secondaryColor: '#0A1628',
      accentColor: '#00D4FF',
      backgroundColor: '#0A1628',
      textColor: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 12,
      glassmorphismIntensity: 50,
    },
  });
  console.log('  ✅ Default theme settings seeded (Futuristic Blue)');
}

async function seedHeroSlides(): Promise<void> {
  const count = await prisma.heroSlide.count();
  if (count > 0) {
    console.log('  ⏭  HeroSlide table already has data, skipping...');
    return;
  }

  await prisma.heroSlide.createMany({
    data: [
      {
        heading: 'International Visitor City Guide',
        subtitle: 'Specially designed for foreign travelers visiting India.',
        includesList: ['Local orientation', 'Cultural assistance', 'Language help', 'Safe public city navigation'],
        ctaText: 'BOOK NOW',
        ctaLink: '/contact',
        overlayOpacity: 40,
        displayOrder: 0,
        isVisible: true,
      },
      {
        heading: 'Domestic & International Travel Support',
        subtitle: 'Users can book Meetvia companions for travel-related assistance during domestic or international visits.',
        includesList: ['Airport pickup assistance', 'City arrival orientation', 'Travel coordination in public spaces', 'Cultural guidance during trips'],
        ctaText: 'BOOK NOW',
        ctaLink: '/contact',
        overlayOpacity: 40,
        displayOrder: 1,
        isVisible: true,
      },
    ],
  });
  console.log('  ✅ 2 hero slides seeded');
}

async function seedServices(): Promise<void> {
  const count = await prisma.service.count();
  if (count > 0) {
    console.log('  ⏭  Service table already has data, skipping...');
    return;
  }

  await prisma.service.createMany({
    data: [
      {
        title: 'City Exploration',
        description: 'Guided City Experience for International Visitors',
        duration: '3–4 hours',
        locationType: 'Public',
        isFeatured: true,
        isVisible: true,
        displayOrder: 0,
        buttonText: 'Book Now',
        buttonLink: '/contact',
      },
      {
        title: 'Virtual City Tour',
        description: 'Explore Indian cities remotely with a live virtual companion',
        duration: '1–2 hours',
        locationType: 'Virtual',
        isFeatured: true,
        isVisible: true,
        displayOrder: 1,
        buttonText: 'Book Now',
        buttonLink: '/contact',
      },
      {
        title: 'Shopping & Event Companion',
        description: 'Professional companion for shopping or attending public events',
        duration: '2–3 hours',
        locationType: 'Public',
        isFeatured: true,
        isVisible: true,
        displayOrder: 2,
        buttonText: 'Book Now',
        buttonLink: '/contact',
      },
      {
        title: 'Guided City Experience',
        description: 'Comprehensive city tours with local insights',
        duration: '3–4 hours',
        locationType: 'Public',
        isFeatured: true,
        isVisible: true,
        displayOrder: 3,
        buttonText: 'Book Now',
        buttonLink: '/contact',
      },
      {
        title: 'Domestic Travel Experience',
        description: 'Travel companion for domestic trips',
        duration: 'Full day',
        locationType: 'Public',
        isFeatured: true,
        isVisible: true,
        displayOrder: 4,
        buttonText: 'Book Now',
        buttonLink: '/contact',
      },
      {
        title: 'International Visitor Travel Support',
        description: 'Complete support for international travelers',
        duration: 'Flexible',
        locationType: 'Flexible',
        isFeatured: true,
        isVisible: true,
        displayOrder: 5,
        buttonText: 'Book Now',
        buttonLink: '/contact',
      },
    ],
  });
  console.log('  ✅ 6 services seeded');
}

async function seedCity(): Promise<void> {
  const count = await prisma.city.count();
  if (count > 0) {
    console.log('  ⏭  City table already has data, skipping...');
    return;
  }

  await prisma.city.create({
    data: {
      cityName: 'Agra',
      state: 'Uttar Pradesh',
      country: 'India',
      status: 'active',
      displayOrder: 1,
    },
  });
  console.log('  ✅ Default city seeded (Agra)');
}

async function seedFAQs(): Promise<void> {
  const count = await prisma.fAQ.count();
  if (count > 0) {
    console.log('  ⏭  FAQ table already has data, skipping...');
    return;
  }

  await prisma.fAQ.createMany({
    data: [
      {
        question: 'Is Meetvia a dating service?',
        answer: 'No. Meetvia is a professional public-only companionship and visitor assistance platform.',
        displayOrder: 0,
      },
      {
        question: 'Are meetings public-only?',
        answer: 'Yes. All sessions must take place in approved public locations.',
        displayOrder: 1,
      },
      {
        question: 'How long is a session?',
        answer: 'Most sessions are structured for 3–4 hours depending on the service.',
        displayOrder: 2,
      },
      {
        question: 'Is Meetvia available in Agra?',
        answer: 'Yes. Meetvia is currently available in Agra, Uttar Pradesh.',
        displayOrder: 3,
      },
      {
        question: 'Can foreign visitors book?',
        answer: 'Yes. Meetvia is designed to assist foreign and domestic visitors with structured public experiences.',
        displayOrder: 4,
      },
      {
        question: 'How do refunds work?',
        answer: 'Refunds depend on the timing of cancellation and the platform refund policy.',
        displayOrder: 5,
      },
    ],
  });
  console.log('  ✅ 6 FAQs seeded');
}


async function seedLegalPages(): Promise<void> {
  const count = await prisma.legalPage.count();
  if (count > 0) {
    console.log('  ⏭  LegalPage table already has data, skipping...');
    return;
  }

  await prisma.legalPage.createMany({
    data: [
      {
        slug: 'safety-policy',
        title: 'Safety Policy',
        content: `<h2>Safety Policy</h2>
<p>At Meetvia, safety is our highest priority. All interactions on our platform are structured to take place exclusively in public locations.</p>

<h3>Public-Only Meetings</h3>
<p>All Meetvia sessions must occur in approved public spaces such as parks, cafes, malls, tourist attractions, and other open venues. Private residences, hotel rooms, and secluded locations are strictly prohibited.</p>

<h3>Verified Companions</h3>
<p>All companions on the Meetvia platform undergo a verification process before being approved to provide services. This includes identity verification and background checks.</p>

<h3>Zero Tolerance Policy</h3>
<p>Meetvia has a zero-tolerance policy for any inappropriate behavior, harassment, or requests that violate our public-only service model. Users or companions found violating these policies will be immediately banned from the platform.</p>

<h3>Reporting Concerns</h3>
<p>If you experience any safety concerns during a session, please contact our support team immediately. We take all reports seriously and will investigate promptly.</p>`,
      },
      {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        content: `<h2>Terms of Service</h2>
<p>By using Meetvia, you agree to the following terms and conditions governing your use of our platform and services.</p>

<h3>Service Description</h3>
<p>Meetvia is a professional public companionship and visitor assistance platform. Our services include city exploration, virtual tours, shopping companionship, and travel support — all conducted in public settings only.</p>

<h3>User Responsibilities</h3>
<p>Users must provide accurate information when booking services. All interactions must take place in public locations. Users must not request or engage in any private, romantic, overnight, or escort-type services.</p>

<h3>Booking and Cancellation</h3>
<p>Bookings are confirmed upon successful submission through our contact form or WhatsApp. Cancellation policies vary by service type and timing. Please refer to our Refund Policy for details.</p>

<h3>Intellectual Property</h3>
<p>All content on the Meetvia website, including text, images, logos, and design elements, is the property of Meetvia and is protected by applicable intellectual property laws.</p>

<h3>Limitation of Liability</h3>
<p>Meetvia facilitates connections between visitors and companions in public settings. While we verify our companions, we are not liable for any incidents that occur outside the scope of our structured services.</p>`,
      },
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: `<h2>Privacy Policy</h2>
<p>Meetvia is committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.</p>

<h3>Information We Collect</h3>
<p>We collect information you provide directly, including your name, email address, phone number, and any messages you send through our contact forms. We also collect companion application details for verification purposes.</p>

<h3>How We Use Your Information</h3>
<p>Your information is used to process service requests, communicate with you about bookings, verify companion applications, and improve our services. We do not sell or share your personal information with third parties for marketing purposes.</p>

<h3>Data Security</h3>
<p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>

<h3>Your Rights</h3>
<p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at info@meetvia.com.</p>

<h3>Contact Us</h3>
<p>If you have questions about this Privacy Policy, please contact us at info@meetvia.com.</p>`,
      },
      {
        slug: 'refund-policy',
        title: 'Refund Policy',
        content: `<h2>Refund Policy</h2>
<p>Meetvia strives to provide excellent service. This policy outlines the terms under which refunds may be issued.</p>

<h3>Cancellation by User</h3>
<p>If you cancel a booking more than 24 hours before the scheduled session, you are eligible for a full refund. Cancellations made within 24 hours of the session may be subject to a cancellation fee.</p>

<h3>Cancellation by Meetvia</h3>
<p>If Meetvia cancels a session due to companion unavailability or other operational reasons, you will receive a full refund or the option to reschedule at no additional cost.</p>

<h3>Service Dissatisfaction</h3>
<p>If you are unsatisfied with the quality of service provided, please contact us within 48 hours of the session. We will review your concern and may offer a partial or full refund at our discretion.</p>

<h3>Refund Processing</h3>
<p>Approved refunds will be processed within 7-10 business days. Refunds will be issued to the original payment method used for the booking.</p>

<h3>Contact Us</h3>
<p>For refund requests or questions, please contact us at info@meetvia.com.</p>`,
      },
    ],
  });
  console.log('  ✅ 4 legal pages seeded');
}

async function seedSocialLinks(): Promise<void> {
  const count = await prisma.socialLink.count();
  if (count > 0) {
    console.log('  ⏭  SocialLink table already has data, skipping...');
    return;
  }

  await prisma.socialLink.createMany({
    data: [
      {
        platform: 'Instagram',
        url: 'https://instagram.com/meetvia',
        iconIdentifier: 'FaInstagram',
        isVisible: true,
        displayOrder: 0,
      },
      {
        platform: 'Facebook',
        url: 'https://facebook.com/meetvia',
        iconIdentifier: 'FaFacebook',
        isVisible: true,
        displayOrder: 1,
      },
      {
        platform: 'YouTube',
        url: 'https://youtube.com/meetvia',
        iconIdentifier: 'FaYoutube',
        isVisible: true,
        displayOrder: 2,
      },
      {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/company/meetvia',
        iconIdentifier: 'FaLinkedin',
        isVisible: true,
        displayOrder: 3,
      },
      {
        platform: 'WhatsApp',
        url: 'https://wa.me/919XXXXXXXXX',
        iconIdentifier: 'FaWhatsapp',
        isVisible: true,
        displayOrder: 4,
      },
    ],
  });
  console.log('  ✅ 5 social links seeded');
}

async function seedHowItWorksSteps(): Promise<void> {
  const count = await prisma.howItWorksStep.count();
  if (count > 0) {
    console.log('  ⏭  HowItWorksStep table already has data, skipping...');
    return;
  }

  await prisma.howItWorksStep.createMany({
    data: [
      {
        stepNumber: 1,
        title: 'Choose Your Activity',
        description: 'Select the type of public activity such as city exploration, shopping visits, or event attendance.',
        displayOrder: 0,
      },
      {
        stepNumber: 2,
        title: 'Confirm Public Meeting',
        description: 'All meetings are arranged in approved public locations only. Private homes and hotel rooms are not allowed.',
        displayOrder: 1,
      },
      {
        stepNumber: 3,
        title: 'Enjoy a Structured Session',
        description: 'Meet for up to 3–4 hours in a public setting with a verified companion.',
        displayOrder: 2,
      },
    ],
  });
  console.log('  ✅ 3 How It Works steps seeded');
}

async function seedSiteSettings(): Promise<void> {
  const count = await prisma.siteSettings.count();
  if (count > 0) {
    console.log('  ⏭  SiteSettings table already has data, skipping...');
    return;
  }

  await prisma.siteSettings.create({
    data: {
      siteName: 'Meetvia',
      metaTitle: 'Meetvia',
      metaDescription: 'Professional city assistance and visitor support services in India',
      contactEmail: 'info@meetvia.com',
      contactPhone: '+91 XXX XXXX XXXX',
      whatsappNumber: '+919XXXXXXXXX',
      whatsappMessage: 'Hello! I would like to know more about Meetvia services.',
      safetyCheckboxText: 'I understand Meetvia is a public-only professional service. Private, romantic, hotel, overnight, or escort requests are not allowed.',
    },
  });
  console.log('  ✅ Default site settings seeded');
}

async function seed(): Promise<void> {
  console.log('🌱 Starting database seed...\n');

  try {
    console.log('📦 Connected to PostgreSQL via Prisma\n');

    // Run all seed functions
    await seedAuthData();
    await seedAdminUser();
    await seedThemeSettings();
    await seedHeroSlides();
    await seedServices();
    await seedCity();
    await seedFAQs();
    await seedLegalPages();
    await seedSocialLinks();
    await seedHowItWorksSteps();
    await seedSiteSettings();

    console.log('\n✨ Seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('📦 Disconnected from PostgreSQL');
  }
}

// Run the seed script
seed();
