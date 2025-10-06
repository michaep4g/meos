/**
 * API Test Script
 * 
 * This script tests the Photo Upload API endpoints.
 * It uses the node-fetch library to make HTTP requests.
 * 
 * To run this test:
 * 1. Make sure the server is running
 * 2. Run: node test/api.test.js
 */

const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3000/api/upload';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

/**
 * Test runner function
 */
async function runTests() {
  console.log(`${colors.blue}=== Photo Upload API Tests ===${colors.reset}\n`);
  
  try {
    // Test 1: Health Check
    await testHealthCheck();
    
    // Test 2: Generate Pre-signed URL
    const presignedResult = await testPresignedUrl();
    
    // Test 3: List Photos
    await testListPhotos();
    
    console.log(`\n${colors.green}All tests completed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}Test failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Test the health check endpoint
 */
async function testHealthCheck() {
  console.log(`${colors.yellow}Testing Health Check...${colors.reset}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(`Health check failed: ${data.error || 'Unknown error'}`);
    }
    
    console.log(`${colors.green}✓ Health check successful${colors.reset}`);
    console.log(`  Status: ${data.message}`);
    console.log(`  Timestamp: ${data.timestamp}`);
    return data;
  } catch (error) {
    console.error(`${colors.red}✗ Health check failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

/**
 * Test the pre-signed URL endpoint
 */
async function testPresignedUrl() {
  console.log(`\n${colors.yellow}Testing Pre-signed URL Generation...${colors.reset}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/presigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: 'test-image.jpg',
        contentType: 'image/jpeg'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(`Pre-signed URL generation failed: ${data.error || 'Unknown error'}`);
    }
    
    console.log(`${colors.green}✓ Pre-signed URL generated successfully${colors.reset}`);
    console.log(`  Key: ${data.data.key}`);
    console.log(`  URL length: ${data.data.url.length} characters`);
    return data.data;
  } catch (error) {
    console.error(`${colors.red}✗ Pre-signed URL generation failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

/**
 * Test the list photos endpoint
 */
async function testListPhotos() {
  console.log(`\n${colors.yellow}Testing List Photos...${colors.reset}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/photos`);
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(`List photos failed: ${data.error || 'Unknown error'}`);
    }
    
    console.log(`${colors.green}✓ Photos listed successfully${colors.reset}`);
    console.log(`  Retrieved ${data.data.length} photos`);
    
    if (data.data.length > 0) {
      console.log(`  First photo key: ${data.data[0].key}`);
    }
    
    return data.data;
  } catch (error) {
    console.error(`${colors.red}✗ List photos failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Run the tests
runTests().catch(console.error);
