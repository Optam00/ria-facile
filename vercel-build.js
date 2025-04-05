import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Log Node.js version and environment
  console.log('Node.js version:', process.version);
  console.log('Current directory:', process.cwd());
  
  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Log node_modules structure
  console.log('Checking node_modules structure...');
  const nodeModulesPath = resolve(process.cwd(), 'node_modules');
  console.log('node_modules path:', nodeModulesPath);
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('Contents of node_modules/vite:');
    const vitePath = resolve(nodeModulesPath, 'vite');
    if (fs.existsSync(vitePath)) {
      console.log(fs.readdirSync(vitePath));
    } else {
      console.log('vite directory not found');
    }
  }

  // Run TypeScript compilation
  console.log('Running TypeScript compilation...');
  execSync('npx tsc', { stdio: 'inherit' });

  // Run Vite build using npx
  console.log('Running Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 