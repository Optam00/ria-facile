import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Run TypeScript compilation
  console.log('Running TypeScript compilation...');
  execSync('npx tsc', { stdio: 'inherit' });

  // Run Vite build with explicit path
  console.log('Running Vite build...');
  execSync('node ./node_modules/vite/bin/vite.js build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 