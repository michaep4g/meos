/**
 * Service Configuration
 * 
 * This file provides configuration for switching between real and mock services.
 * Set USE_MOCK_SERVICES to true to use mock implementations for local development.
 */

// Set to true to use mock services, false to use real AWS services
export const USE_MOCK_SERVICES = process.env.USE_MOCK_SERVICES === 'true' || false;

// Import both real and mock services
import { s3Service as realS3Service } from '../services/s3.service';
import { mockS3Service } from '../services/mock-s3.service';

// Export the appropriate service based on configuration
export const s3Service = USE_MOCK_SERVICES ? mockS3Service : realS3Service;

// Log which service is being used
console.log(`[CONFIG] Using ${USE_MOCK_SERVICES ? 'MOCK' : 'REAL'} S3 service`);
