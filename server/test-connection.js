import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI?.replace(/:[^:]*@/, ':***@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful!');
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('bad auth')) {
      console.log('\n🔧 Authentication failed. Please check:');
      console.log('1. Username: nagalamac');
      console.log('2. Password: Make sure it matches your MongoDB Atlas password');
      console.log('3. Database user permissions');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 DNS resolution failed. Please check:');
      console.log('1. Cluster URL: cluster0.4jurueu.mongodb.net');
      console.log('2. Network connectivity');
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

testConnection();
