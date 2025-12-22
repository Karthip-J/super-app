#!/usr/bin/env node

// Custom build script to disable ESLint during build
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.CI = 'false';
process.env.SKIP_PREFLIGHT_CHECK = 'true';

console.log('🔧 Custom build script: ESLint disabled');
console.log('🔧 Environment variables set:');
console.log('   - DISABLE_ESLINT_PLUGIN:', process.env.DISABLE_ESLINT_PLUGIN);
console.log('   - CI:', process.env.CI);
console.log('   - SKIP_PREFLIGHT_CHECK:', process.env.SKIP_PREFLIGHT_CHECK);

// Run the actual build
const { spawn } = require('child_process');
const buildProcess = spawn('npx', ['react-scripts', 'build'], {
  stdio: 'inherit',
  env: { ...process.env }
});

buildProcess.on('close', (code) => {
  console.log(`🔧 Build process exited with code ${code}`);
  process.exit(code);
}); 