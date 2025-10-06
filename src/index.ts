import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import uploadRoutes from './routes/upload.routes';
import { USE_MOCK_SERVICES } from './config/service-config';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// If using mock services, serve the mock storage directory
if (USE_MOCK_SERVICES) {
  const mockStoragePath = path.join(__dirname, '../mock-storage');
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(mockStoragePath)) {
    fs.mkdirSync(mockStoragePath, { recursive: true });
  }
  
  // Serve the mock storage directory
  app.use('/mock-storage', express.static(mockStoragePath));
  console.log(`[Server] Serving mock storage from ${mockStoragePath}`);
}

// Routes
app.use('/api/upload', uploadRoutes);

// Root endpoint - serve the HTML tester interface
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Photo Upload API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/upload/health',
      uploadSingle: 'POST /api/upload/single',
      uploadMultiple: 'POST /api/upload/multiple',
      listPhotos: 'GET /api/upload/photos',
      deletePhoto: 'DELETE /api/upload/photos/:key',
      presignedUrl: 'POST /api/upload/presigned',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
