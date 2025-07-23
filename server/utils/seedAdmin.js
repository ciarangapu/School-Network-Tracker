import Admin from '../models/Admin.js';

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    
    if (!existingAdmin) {
      const admin = new Admin({
        name: 'System Administrator',
        email: 'admin@example.com',
        password: 'admin123' // This will be hashed automatically
      });
      
      await admin.save();
      console.log('✅ Default admin user created');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};

export default seedAdmin;