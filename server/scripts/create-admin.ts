import 'dotenv/config';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { getErrorMessage, logError } from '../utils/errorHandler';

// Hash password using same method as auth routes
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createAdminAccount() {
  if (!db) {
    console.error('❌ Database not available. Make sure DATABASE_URL is set.');
    process.exit(1);
  }

  const username = 'info@code-masters.co.za';
  const email = 'info@code-masters.co.za';
  const password = 'Diamond2024!!!';
  const hashedPassword = hashPassword(password);

  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('⚠️  User already exists with username:', username);
      console.log('   If you want to reset the password, please delete the user first.');
      process.exit(0);
    }

    // Create admin user with administrator role
    const newUser = await db
      .insert(users)
      .values({
        username: username,
        email: email,
        password: hashedPassword,
        role: 'administrator', // Set as administrator
      })
      .returning();

    console.log('✅ Administrator account created successfully!');
    console.log('');
    console.log('Account Details:');
    console.log('  Username:', username);
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('');
    console.log('You can now log in using:');
    console.log('  Username/Email:', username);
    console.log('  Password:', password);
    console.log('');
    console.log('⚠️  Please change your password after first login for security.');

    process.exit(0);
  } catch (error: unknown) {
    logError(error, 'Create Admin Script');
    const errorMessage = getErrorMessage(error);
    console.error('❌ Failed to create admin account:', errorMessage);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error, error);
    }
    process.exit(1);
  }
}

// Run the script
createAdminAccount();

