import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  try {
    const headers = event.headers || {};
    const auth = headers.Authorization || "";

    // Simple authorization (optional)
    if (auth !== `Bearer ${process.env.SECRET_KEY}`) {
      return { statusCode: 401, body: "Unauthorized" };
    }

    const body = JSON.parse(event.body || "{}");
    if (!body.image) {
      return { statusCode: 400, body: "Missing image data" };
    }

    const imageBuffer = Buffer.from(body.image, "base64");
    const key = `photos/${Date.now()}.jpg`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: "image/jpeg"
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, key }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
