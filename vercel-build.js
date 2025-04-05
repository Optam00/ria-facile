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

  // Install Vite globally
  console.log('Installing Vite globally...');
  execSync('npm install -g vite@4.5.12', { stdio: 'inherit' });

  // Log node_modules structure
  console.log('Checking node_modules structure...');
  const nodeModulesPath = resolve(process.cwd(), 'node_modules');
  console.log('node_modules path:', nodeModulesPath);
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('Contents of node_modules/vite:');
    const vitePath = resolve(nodeModulesPath, 'vite');
    if (fs.existsSync(vitePath)) {
      console.log(fs.readdirSync(vitePath));
      
      // Check dist directory specifically
      const distPath = resolve(vitePath, 'dist');
      if (fs.existsSync(distPath)) {
        console.log('Contents of vite/dist:');
        console.log(fs.readdirSync(distPath));
        
        // Check node directory
        const nodePath = resolve(distPath, 'node');
        if (fs.existsSync(nodePath)) {
          console.log('Contents of vite/dist/node:');
          console.log(fs.readdirSync(nodePath));
          
          // Check chunks directory
          const chunksPath = resolve(nodePath, 'chunks');
          if (fs.existsSync(chunksPath)) {
            console.log('Contents of vite/dist/node/chunks:');
            console.log(fs.readdirSync(chunksPath));
          }
        }
      }
    } else {
      console.log('vite directory not found');
    }
  }

  // Run TypeScript compilation
  console.log('Running TypeScript compilation...');
  execSync('npx tsc', { stdio: 'inherit' });

  // Run Vite build using global installation
  console.log('Running Vite build...');
  execSync('vite build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 