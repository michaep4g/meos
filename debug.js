/**
 * Debug Script for Photo Upload API
 * 
 * This script helps run the application in debug mode without requiring TypeScript compilation.
 * It uses ts-node to run the TypeScript code directly.
 * 
 * Usage:
 * node debug.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('Installing dependencies...');
  
  // Install dependencies
  const install = spawn('npm', ['install', '--no-package-lock'], { 
    stdio: 'inherit',
    shell: true
  });
  
  install.on('close', (code) => {
    if (code !== 0) {
      console.error('Failed to install dependencies');
      process.exit(1);
    }
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  // Check if ts-node is installed
  try {
    require.resolve('ts-node');
  } catch (e) {
    console.log('Installing ts-node...');
    const installTsNode = spawn('npm', ['install', '--no-save', 'ts-node'], { 
      stdio: 'inherit',
      shell: true
    });
    
    installTsNode.on('close', (code) => {
      if (code !== 0) {
        console.error('Failed to install ts-node');
        process.exit(1);
      }
      runWithTsNode();
    });
    return;
  }
  
  runWithTsNode();
}

function runWithTsNode() {
  console.log('Starting server in debug mode...');
  console.log('Using mock services: ' + (process.env.USE_MOCK_SERVICES || 'true'));
  
  // Set environment variables
  const env = { ...process.env, USE_MOCK_SERVICES: 'true' };
  
  // Run with ts-node
  const server = spawn('npx', ['ts-node', 'src/index.ts'], { 
    stdio: 'inherit',
    env,
    shell: true
  });
  
  server.on('close', (code) => {
    if (code !== 0) {
      console.error(`Server exited with code ${code}`);
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Stopping server...');
    server.kill('SIGINT');
    process.exit(0);
  });
}
