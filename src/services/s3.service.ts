import { 
  PutObjectCommand, 
  PutObjectCommandInput, 
  ListObjectsV2Command, 
  DeleteObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, s3Config } from '../config/aws.config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export interface S3Object {
  key: string;
  url: string;
  lastModified?: Date;
  size?: number;
}

export class S3Service {
  async uploadPhoto(file: Express.Multer.File): Promise<UploadResult> {
    try {
      // Validate file type
      if (!s3Config.allowedMimeTypes.includes(file.mimetype)) {
        return {
          success: false,
          error: `Invalid file type. Allowed types: ${s3Config.allowedMimeTypes.join(', ')}`,
        };
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const key = `photos/${fileName}`;

      // Prepare S3 upload parameters
      const uploadParams: PutObjectCommandInput = {
        Bucket: s3Config.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make the uploaded file publicly accessible
      };

      // Upload to S3
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // Generate the URL
      const url = `https://${s3Config.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

      return {
        success: true,
        key,
        url,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async uploadMultiplePhotos(files: Express.Multer.File[]): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadPhoto(file));
    return Promise.all(uploadPromises);
  }

  /**
   * List photos from the S3 bucket
   * @param prefix Optional prefix to filter objects (e.g., 'photos/')
   * @param maxKeys Maximum number of objects to return
   * @returns Array of S3Object with key and URL
   */
  async listPhotos(prefix: string = 'photos/', maxKeys: number = 100): Promise<S3Object[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: s3Config.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await s3Client.send(command);
      
      if (!response.Contents) {
        return [];
      }

      return response.Contents.map((item) => {
        const key = item.Key || '';
        return {
          key,
          url: `https://${s3Config.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
          lastModified: item.LastModified,
          size: item.Size,
        };
      });
    } catch (error) {
      console.error('Error listing photos:', error);
      throw error;
    }
  }

  /**
   * Delete a photo from S3
   * @param key The key of the object to delete
   * @returns Success status
   */
  async deletePhoto(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
      });

      await s3Client.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error deleting photo:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Generate a pre-signed URL for client-side uploads
   * @param fileName Original file name
   * @param contentType MIME type of the file
   * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Pre-signed URL and the object key
   */
  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<{ url: string; key: string }> {
    try {
      // Validate content type
      if (!s3Config.allowedMimeTypes.includes(contentType)) {
        throw new Error(`Invalid file type. Allowed types: ${s3Config.allowedMimeTypes.join(', ')}`);
      }

      // Generate unique filename
      const fileExtension = path.extname(fileName);
      const uniqueFileName = `${uuidv4()}${fileExtension}`;
      const key = `photos/${uniqueFileName}`;

      const command = new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });

      return { url, key };
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw error;
    }
  }
}

export const s3Service = new S3Service();
