import { spawn } from 'child_process';
import { configDotenv } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
configDotenv();

console.log('🚀 Starting Nawa School Management System in Production Mode');
console.log('=' .repeat(60));

// Check if required environment variables are set
const requiredEnvVars = [
  'MYSQL_HOST',
  'MYSQL_USER', 
  'MYSQL_PASSWORD',
  'MYSQL_DATABASE',
  'SECRET_KEY'
];

console.log('🔍 Checking environment variables...');
let envCheckPassed = true;

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    envCheckPassed = false;
  } else {
    console.log(`✅ ${envVar}: ${envVar.includes('PASSWORD') || envVar.includes('SECRET') ? '[HIDDEN]' : process.env[envVar]}`);
  }
});

if (!envCheckPassed) {
  console.error('\n❌ Environment check failed. Please update your .env file.');
  process.exit(1);
}

console.log('✅ Environment variables check passed');

// Check if essential directories exist
const requiredDirs = ['config', 'models', 'routes', 'controllers'];
console.log('\n🔍 Checking required directories...');

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ Directory exists: ${dir}`);
  } else {
    console.error(`❌ Missing directory: ${dir}`);
    envCheckPassed = false;
  }
});

if (!envCheckPassed) {
  console.error('\n❌ Directory check failed. Please ensure all backend files are uploaded.');
  process.exit(1);
}

console.log('✅ Directory structure check passed');

// Start the application
console.log('\n🚀 Starting the application...');
console.log('=' .repeat(60));

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

// Start the main application
const child = spawn('node', ['index.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

child.on('close', (code) => {
  console.log(`\n📊 Application exited with code ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
  child.kill('SIGTERM');
});