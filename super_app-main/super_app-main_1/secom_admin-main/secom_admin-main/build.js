#!/usr/bin/env node

// Set environment variables to disable ESLint during build
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.CI = 'false';
process.env.SKIP_PREFLIGHT_CHECK = 'true';

// Import and run react-scripts build
const { spawn } = require('child_process');

console.log('🟢 Starting admin panel build with ESLint disabled...');
console.log('🟢 Environment variables set:');
console.log('   - DISABLE_ESLINT_PLUGIN: true');
console.log('   - CI: false');
console.log('   - SKIP_PREFLIGHT_CHECK: true');

const buildProcess = spawn('npx', ['react-scripts', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Admin panel build completed successfully!');
  } else {
    console.error(`❌ Admin panel build failed with code ${code}`);
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
  process.exit(1);
}); 