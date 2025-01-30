import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import multer from "multer";

// 設定 AWS S3 連接
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// 設定 Multer 上傳
const upload = multer({ storage: multer.memoryStorage() });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const fileBuffer = await file.arrayBuffer();
    const fileName = `uploads/${Date.now()}-${file.name}`;

    // 上傳到 S3
    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: fileName,
        Body: Buffer.from(fileBuffer),
        ACL: "public-read",
        ContentType: file.type,
      })
      .promise();

    return NextResponse.json({ url: uploadResult.Location });
  } catch (error) {
    console.error("Upload failed:", error);

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
