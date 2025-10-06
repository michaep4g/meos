# Debugging Guide for Photo Upload API

This guide will help you debug and test the Photo Upload API project.

## Prerequisites

Before you start debugging, make sure you have:

1. Node.js installed (v14 or higher)
2. AWS account with S3 bucket set up
3. AWS credentials with appropriate permissions

## Setup for Debugging

1. **Install dependencies manually**

Since there might be authentication issues with npm, you can install the required dependencies manually:

```bash
npm install --no-package-lock express cors dotenv multer uuid @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install --no-package-lock --save-dev typescript ts-node-dev @types/express @types/cors @types/multer @types/uuid @types/node
```

2. **Configure environment variables**

Make sure your `.env` file is properly configured with your AWS credentials:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# AWS Configuration
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# S3 Configuration
S3_BUCKET_NAME=your-bucket-name
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

## Running in Debug Mode

### Option 1: Using ts-node directly

If ts-node-dev is not working, you can use ts-node directly:

```bash
npx ts-node src/index.ts
```

### Option 2: Compile and run

Compile the TypeScript code first, then run the JavaScript:

```bash
npx tsc
node dist/index.js
```

### Option 3: Using Node.js debugger

1. Compile the TypeScript code:

```bash
npx tsc
```

2. Start the Node.js debugger:

```bash
node --inspect dist/index.js
```

3. Connect to the debugger using Chrome DevTools by navigating to `chrome://inspect` in Chrome browser.

## Common Issues and Solutions

### 1. TypeScript Compilation Errors

If you encounter TypeScript errors:

```bash
npx tsc --noEmit
```

This will show all TypeScript errors without generating output files.

### 2. AWS S3 Connection Issues

If you have issues connecting to AWS S3:

- Verify your AWS credentials in the `.env` file
- Check that your S3 bucket exists and is accessible
- Ensure your IAM user has the necessary permissions for S3 operations

### 3. Testing API Endpoints

You can test the API endpoints using:

1. The HTML interface at http://localhost:3000
2. The test script:

```bash
node test/api.test.js
```

3. Using curl commands:

```bash
# Health check
curl http://localhost:3000/api/upload/health

# List photos
curl http://localhost:3000/api/upload/photos

# Generate pre-signed URL
curl -X POST -H "Content-Type: application/json" -d '{"fileName":"test.jpg","contentType":"image/jpeg"}' http://localhost:3000/api/upload/presigned
```

### 4. Debugging Specific Components

#### S3 Service

To debug S3 service issues, add console logs in `src/services/s3.service.ts`:

```typescript
console.log('S3 Config:', s3Config);
console.log('AWS Config:', awsConfig);
```

#### Upload Routes

To debug route issues, add console logs in `src/routes/upload.routes.ts`:

```typescript
console.log('Request received:', req.path);
console.log('Request body:', req.body);
console.log('Request files:', req.files || req.file);
```

## Mock Mode for Development

If you want to develop without an actual AWS S3 connection, you can create a mock S3 service:

1. Create a file `src/services/mock-s3.service.ts` with mock implementations
2. Update imports in routes to use the mock service during development

## Logging

To enhance debugging, you can add a logging utility:

1. Install a logging library:

```bash
npm install winston
```

2. Create a logger utility and use it throughout the application

## Next Steps

Once you've resolved the debugging issues:

1. Complete the AWS configuration in your `.env` file
2. Run the application using one of the methods above
3. Test the API using the HTML interface or test script
4. Monitor the console for any errors or issues
