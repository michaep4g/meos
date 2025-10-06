import { PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { s3Client, s3Config } from '../config/aws.config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
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
}

export const s3Service = new S3Service();
