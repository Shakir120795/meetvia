import prisma from '../config/db';

async function updateAdminUser() {
  try {
    const user = await prisma.adminUser.update({
      where: { email: 'admin@meetvia.com' },
      data: { 
        isSuperAdmin: true, 
        isActive: true 
      }
    });
    
    console.log('✅ Updated admin user:', user.email);
    console.log('   isSuperAdmin:', user.isSuperAdmin);
    console.log('   isActive:', user.isActive);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin user:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateAdminUser();