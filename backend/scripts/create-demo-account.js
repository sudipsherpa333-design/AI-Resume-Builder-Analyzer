/**
 * Script to create a demo account for public testing
 * Run: node backend/scripts/create-demo-account.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const createDemoAccount = async () => {
    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected');

        // Check if demo account already exists
        const existingDemo = await User.findOne({ email: 'demo@resumebuilder.com' });

        if (existingDemo) {
            console.log('⚠️  Demo account already exists!');
            console.log('Email:', existingDemo.email);
            console.log('Name:', existingDemo.name);
            console.log('Verified:', existingDemo.isVerified);

            // Update to ensure it's verified and has correct data
            existingDemo.isVerified = true;
            existingDemo.password = 'demopassword123';
            await existingDemo.save();
            console.log('✅ Updated demo account (verified & password reset)');
        } else {
            // Create demo account
            console.log('📝 Creating demo account...');
            const demoUser = await User.create({
                name: 'Demo User',
                email: 'demo@resumebuilder.com',
                password: 'demopassword123', // Will be hashed by pre-save hook
                phone: '+1234567890',
                isVerified: true, // Mark as verified so no email verification needed
                role: 'user',
                profile: {
                    title: 'Demo Account',
                    headline: 'This is a demo account for testing the Resume Builder',
                    summary: 'Welcome to AI Resume Builder & Analyzer! This demo account is available for everyone to test all features without registration.',
                    location: 'Demo City',
                    website: 'https://resumebuilder.demo',
                    phone: '+1234567890'
                }
            });

            console.log('✅ Demo account created successfully!');
            console.log('📧 Email: demo@resumebuilder.com');
            console.log('🔐 Password: demopassword123');
            console.log('👤 Name: Demo User');
            console.log('🆔 ID:', demoUser._id);
        }

        console.log('\n✅ Demo account setup complete!');
        console.log('\n📖 Instructions:');
        console.log('1. Go to http://localhost:5175/login');
        console.log('2. Click "🎬 Try Demo Account" button');
        console.log('3. You will be logged in as demo user');
        console.log('4. Redirect to dashboard automatically');
        console.log('\n');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating demo account:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

createDemoAccount();
