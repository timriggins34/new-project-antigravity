const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Creating Admin User...');
  
  try {
    // Hash the password 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name: 'System Admin',
        username: 'admin',
        passwordHash: hashedPassword,
        role: 'ADMIN' // Based on the Role enum in your schema
      }
    });
    
    console.log(`✅ Success! User created.`);
    console.log(`➡️  Username: admin`);
    console.log(`➡️  Password: admin123`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ User "admin" already exists!');
    } else {
      console.error('❌ Error creating user:', error);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });