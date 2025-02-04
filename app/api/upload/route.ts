import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  // 確保請求是 multipart/form-data 格式
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const fileName = `${Date.now()}-${file.name}`;

    const bucketName = process.env.AWS_S3_BUCKET_NAME!
    const region = process.env.AWS_REGION!;
    const key = `chat-app/${fileName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: fileBuffer,
      ContentType: file.type,
    };

    // 上傳到 S3
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;


    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload failed:", error);

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
