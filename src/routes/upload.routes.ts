import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.middleware';
import { s3Service, S3Object } from '../services/s3.service';

const router = Router();

/**
 * POST /api/upload/single
 * Upload a single photo to S3
 */
router.post('/single', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const result = await s3Service.uploadPhoto(req.file);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Photo uploaded successfully',
        data: {
          key: result.key,
          url: result.url,
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/upload/multiple
 * Upload multiple photos to S3
 */
router.post('/multiple', upload.array('photos', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
    }

    const results = await s3Service.uploadMultiplePhotos(req.files);

    const successfulUploads = results.filter((r) => r.success);
    const failedUploads = results.filter((r) => !r.success);

    return res.status(200).json({
      success: true,
      message: `${successfulUploads.length} photos uploaded successfully`,
      data: {
        successful: successfulUploads.map((r) => ({
          key: r.key,
          url: r.url,
        })),
        failed: failedUploads.map((r) => ({
          error: r.error,
        })),
      },
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/upload/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Upload service is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/upload/photos
 * List all photos in the S3 bucket
 */
router.get('/photos', async (req: Request, res: Response) => {
  try {
    const prefix = req.query.prefix as string || 'photos/';
    const maxKeys = parseInt(req.query.maxKeys as string || '100');
    
    const photos = await s3Service.listPhotos(prefix, maxKeys);
    
    return res.status(200).json({
      success: true,
      message: `Retrieved ${photos.length} photos`,
      data: photos,
    });
  } catch (error) {
    console.error('Error listing photos:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * DELETE /api/upload/photos/:key
 * Delete a photo from S3
 */
router.delete('/photos/:key', async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    
    // URL decode the key if it's encoded
    const decodedKey = decodeURIComponent(key);
    
    const result = await s3Service.deletePhoto(decodedKey);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Photo deleted successfully',
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/upload/presigned
 * Generate a pre-signed URL for client-side uploads
 */
router.post('/presigned', async (req: Request, res: Response) => {
  try {
    const { fileName, contentType, expiresIn } = req.body;
    
    if (!fileName || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'fileName and contentType are required',
      });
    }
    
    const result = await s3Service.getPresignedUploadUrl(
      fileName,
      contentType,
      expiresIn || 3600
    );
    
    return res.status(200).json({
      success: true,
      message: 'Pre-signed URL generated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
