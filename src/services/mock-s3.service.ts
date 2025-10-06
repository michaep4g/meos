import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { UploadResult, S3Object } from './s3.service';

// Ensure the mock storage directory exists
const MOCK_STORAGE_DIR = path.join(__dirname, '../../mock-storage');
if (!fs.existsSync(MOCK_STORAGE_DIR)) {
  fs.mkdirSync(MOCK_STORAGE_DIR, { recursive: true });
}

// Mock configuration
const mockConfig = {
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  maxFileSize: 5242880, // 5MB default
};

/**
 * Mock S3 Service for local development and testing
 * This service mimics the behavior of the real S3 service but stores files locally
 */
export class MockS3Service {
  private baseUrl: string;

  constructor() {
    // Use localhost URL for development
    this.baseUrl = 'http://localhost:3000/mock-storage';
  }

  /**
   * Upload a photo to local storage
   */
  async uploadPhoto(file: Express.Multer.File): Promise<UploadResult> {
    try {
      // Validate file type
      if (!mockConfig.allowedMimeTypes.includes(file.mimetype)) {
        return {
          success: false,
          error: `Invalid file type. Allowed types: ${mockConfig.allowedMimeTypes.join(', ')}`,
        };
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const key = `photos/${fileName}`;
      const filePath = path.join(MOCK_STORAGE_DIR, fileName);

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Generate mock URL
      const url = `${this.baseUrl}/${fileName}`;

      console.log(`[MOCK S3] File uploaded: ${filePath}`);

      return {
        success: true,
        key,
        url,
      };
    } catch (error) {
      console.error('[MOCK S3] Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Upload multiple photos to local storage
   */
  async uploadMultiplePhotos(files: Express.Multer.File[]): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadPhoto(file));
    return Promise.all(uploadPromises);
  }

  /**
   * List photos from local storage
   */
  async listPhotos(prefix: string = 'photos/', maxKeys: number = 100): Promise<S3Object[]> {
    try {
      // Read files from mock storage directory
      const files = fs.readdirSync(MOCK_STORAGE_DIR);
      
      // Filter and limit files
      const filteredFiles = files
        .filter(file => !prefix || file.startsWith(prefix.replace('photos/', '')))
        .slice(0, maxKeys);
      
      // Map to S3Object format
      return filteredFiles.map(file => {
        const filePath = path.join(MOCK_STORAGE_DIR, file);
        const stats = fs.statSync(filePath);
        const key = `photos/${file}`;
        
        return {
          key,
          url: `${this.baseUrl}/${file}`,
          lastModified: stats.mtime,
          size: stats.size,
        };
      });
    } catch (error) {
      console.error('[MOCK S3] Error listing photos:', error);
      return [];
    }
  }

  /**
   * Delete a photo from local storage
   */
  async deletePhoto(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract filename from key
      const fileName = key.replace('photos/', '');
      const filePath = path.join(MOCK_STORAGE_DIR, fileName);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return { 
          success: false, 
          error: 'File not found' 
        };
      }
      
      // Delete file
      fs.unlinkSync(filePath);
      console.log(`[MOCK S3] File deleted: ${filePath}`);
      
      return { success: true };
    } catch (error) {
      console.error('[MOCK S3] Error deleting photo:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Generate a pre-signed URL for client-side uploads (mock version)
   */
  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<{ url: string; key: string }> {
    try {
      // Validate content type
      if (!mockConfig.allowedMimeTypes.includes(contentType)) {
        throw new Error(`Invalid file type. Allowed types: ${mockConfig.allowedMimeTypes.join(', ')}`);
      }

      // Generate unique filename
      const fileExtension = path.extname(fileName);
      const uniqueFileName = `${uuidv4()}${fileExtension}`;
      const key = `photos/${uniqueFileName}`;

      // In a real implementation, this would be a pre-signed URL
      // For mock purposes, we'll just return a URL to our mock upload endpoint
      const url = `${this.baseUrl}/mock-upload?key=${key}&contentType=${encodeURIComponent(contentType)}`;

      console.log(`[MOCK S3] Pre-signed URL generated for: ${key}`);

      return { url, key };
    } catch (error) {
      console.error('[MOCK S3] Error generating pre-signed URL:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const mockS3Service = new MockS3Service();
