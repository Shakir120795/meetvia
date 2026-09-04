import prisma from './db';
import { hashPassword } from '../utils/password';

/**
 * Seed authentication-related data: permissions, super admin, feature toggles
 */
export async function seedAuthData(): Promise<void> {
  console.log('  🔐 Seeding auth data...');

  // 1. Create default permissions
  const defaultPermissions = [
    { key: 'VIEW_DASHBOARD', label: 'View Dashboard' },
    { key: 'MANAGE_USERS', label: 'Manage Users' },
    { key: 'MANAGE_COMPANIONS', label: 'Manage Companions' },
    { key: 'APPROVE_BOOKINGS', label: 'Approve Bookings' },
    { key: 'VIEW_BOOKINGS', label: 'View Bookings' },
    { key: 'MANAGE_PAYMENTS', label: 'Manage Payments & Payouts' },
    { key: 'VIEW_REPORTS', label: 'View Reports & Analytics' },
    { key: 'MANAGE_CONTENT', label: 'Manage CMS Content' },
    { key: 'MANAGE_SITE_SETTINGS', label: 'Manage Site Settings' },
    { key: 'VIEW_SITE_SETTINGS', label: 'View Site Settings' },
    { key: 'MANAGE_PERMISSIONS', label: 'Manage Permissions & Roles' },
    { key: 'VIEW_PERMISSIONS', label: 'View Permissions' },
    { key: 'MANAGE_MEDIA', label: 'Manage Media Files' },
    { key: 'VIEW_AUDIT_LOGS', label: 'View Audit Logs' }
  ];

  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { label: perm.label },
      create: perm
    });
  }

  // 2. Ensure super admin exists
  const superAdminEmail = 'admin@meetvia.com';
  const existingSuperAdmin = await prisma.adminUser.findUnique({
    where: { email: superAdminEmail }
  });

  if (!existingSuperAdmin) {
    const superAdminPassword = await hashPassword('ChangeMe123!');
    await prisma.adminUser.create({
      data: {
        email: superAdminEmail,
        password: superAdminPassword,
        name: 'Super Admin',
        isSuperAdmin: true,
        isActive: true
      }
    });
    console.log('    ✅ Super admin created');
  }

  // 3. Create default feature toggles
  const defaultToggles = [
    {
      key: 'login_methods_enabled',
      value: {
        email_otp: true,
        google_oauth: false,  // Will implement in Phase 1 task 2
        apple_oauth: false,   // Will implement in Phase 1 task 3  
        whatsapp_otp: false   // Will implement in Phase 1 task 4
      },
      isEnabled: true
    },
    {
      key: 'site_taglines',
      value: {
        primary: "Your Trusted Local Guide & Travel Companion",
        secondary: "Explore Cities with Verified Local Companions",
        tertiary: "Safe, Verified Companionship for Travelers"
      },
      isEnabled: true
    },
    {
      key: 'legal_scope_statement',
      value: {
        scope_text: "Meetvia provides tourism/companionship assistance — city tours, translation, local guidance, airport/hotel pickup assistance.",
        zero_tolerance_clause: "Any companion or user found soliciting, offering, or requesting sexual services through this platform will be immediately banned and, where applicable, reported to law enforcement authorities."
      },
      isEnabled: true
    },
    {
      key: 'payment_timing',
      value: 'POST_CONFIRM', // PRE_CONFIRM | POST_CONFIRM
      isEnabled: true
    },
    {
      key: 'default_booking_mode', 
      value: 'ADMIN_APPROVAL_REQUIRED', // INSTANT | ADMIN_APPROVAL_REQUIRED
      isEnabled: true
    },
    {
      key: 'cancellation_policy',
      value: {
        grace_period_minutes: 30,
        full_refund_hours: 24,
        partial_refund_hours: 6,
        partial_refund_percent: 50
      },
      isEnabled: true
    },
    {
      key: 'commission_percentage',
      value: 20,
      isEnabled: true
    }
  ];

  for (const toggle of defaultToggles) {
    await prisma.siteFeatureToggle.upsert({
      where: { key: toggle.key },
      update: { 
        value: toggle.value, 
        isEnabled: toggle.isEnabled 
      },
      create: toggle
    });
  }

  console.log('    ✅ Default permissions, super admin, and feature toggles seeded');
}