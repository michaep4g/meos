# Photo Upload API

A TypeScript API for uploading photos to AWS S3.

## Features

- Upload single photos to AWS S3
- Upload multiple photos in one request
- List all uploaded photos
- Delete photos from S3
- Generate pre-signed URLs for client-side uploads
- Validation for file types and sizes
- Error handling

## Prerequisites

- Node.js (v14+)
- AWS account with S3 bucket
- AWS credentials with appropriate permissions

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your AWS credentials and S3 bucket name.

## Configuration

Edit the `.env` file to configure the application:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# S3 Configuration
S3_BUCKET_NAME=your-bucket-name
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

```
GET /api/upload/health
```

Returns the status of the API.

### Upload Single Photo

```
POST /api/upload/single
```

Upload a single photo to S3.

**Request:**
- Form data with a file field named `photo`

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "key": "photos/uuid-filename.jpg",
    "url": "https://bucket-name.s3.region.amazonaws.com/photos/uuid-filename.jpg"
  }
}
```

### Upload Multiple Photos

```
POST /api/upload/multiple
```

Upload multiple photos to S3 (up to 10 files).

**Request:**
- Form data with a files field named `photos`

**Response:**
```json
{
  "success": true,
  "message": "3 photos uploaded successfully",
  "data": {
    "successful": [
      {
        "key": "photos/uuid-filename1.jpg",
        "url": "https://bucket-name.s3.region.amazonaws.com/photos/uuid-filename1.jpg"
      },
      {
        "key": "photos/uuid-filename2.jpg",
        "url": "https://bucket-name.s3.region.amazonaws.com/photos/uuid-filename2.jpg"
      },
      {
        "key": "photos/uuid-filename3.jpg",
        "url": "https://bucket-name.s3.region.amazonaws.com/photos/uuid-filename3.jpg"
      }
    ],
    "failed": []
  }
}
```

### List Photos

```
GET /api/upload/photos
```

List all photos in the S3 bucket.

**Query Parameters:**
- `prefix` (optional): Filter by prefix (default: "photos/")
- `maxKeys` (optional): Maximum number of photos to return (default: 100)

**Response:**
```json
{
  "success": true,
  "message": "Retrieved 5 photos",
  "data": [
    {
      "key": "photos/uuid-filename1.jpg",
      "url": "https://bucket-name.s3.region.amazonaws.com/photos/uuid-filename1.jpg",
      "lastModified": "2023-01-01T00:00:00.000Z",
      "size": 1024
    },
    ...
  ]
}
```

### Delete Photo

```
DELETE /api/upload/photos/:key
```

Delete a photo from S3.

**URL Parameters:**
- `key`: The S3 object key (URL-encoded if necessary)

**Response:**
```json
{
  "success": true,
  "message": "Photo deleted successfully"
}
```

### Generate Pre-signed URL

```
POST /api/upload/presigned
```

Generate a pre-signed URL for client-side uploads.

**Request Body:**
```json
{
  "fileName": "example.jpg",
  "contentType": "image/jpeg",
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pre-signed URL generated successfully",
  "data": {
    "url": "https://bucket-name.s3.region.amazonaws.com/photos/uuid-filename.jpg?AWSAccessKeyId=...",
    "key": "photos/uuid-filename.jpg"
  }
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Allowed File Types

- image/jpeg
- image/jpg
- image/png
- image/gif
- image/webp

## File Size Limit

The default file size limit is 5MB, configurable via the `MAX_FILE_SIZE` environment variable.
