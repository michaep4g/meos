import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.middleware';
import { s3Service } from '../services/s3.service';

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

export default router;
