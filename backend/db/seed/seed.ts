import dotenv from 'dotenv';
dotenv.config();

import db from '../../src/lib/database';
import { hash } from 'bcrypt-ts';
import { User } from '../../src/types';

async function seedAdminUser(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if admin user already exists
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], async (err, existingUser: User) => {
      if (err) {
        console.error('❌ Error checking for existing admin user:', err);
        db.close();
        process.exit(1);
      }
      
      if (existingUser) {
        console.log('⚠️  Admin user already exists. Skipping creation.');
        db.close();
        return;
      }
      
      // Hash the password
      const hashedPassword = await hash('rahasia', 10);
      
      // Insert admin user
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hashedPassword], function(err) {
        if (err) {
          console.error('❌ Error creating admin user:', err);
          db.close();
          process.exit(1);
        }
        
        console.log('✅ Admin user created successfully!');
        console.log('📋 Admin credentials:');
        console.log('   Username: admin');
        console.log('   Password: rahasia');
        console.log('');
        console.log('🚀 You can now log in to the application with these credentials.');
        
        db.close();
      });
    });
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    db.close();
    process.exit(1);
  }
}

// Run the seeding
seedAdminUser();