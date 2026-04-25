import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string || 'image';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 检查是否配置了S3存储
    if (!process.env.COZE_BUCKET_ENDPOINT_URL || !process.env.COZE_BUCKET_NAME) {
      return NextResponse.json({ 
        error: '暂不支持本地上传，请使用URL方式添加作品',
        hint: '您可以将图片/PDF上传到图床（如 imgbb.com）或GitHub，然后粘贴链接',
        code: 'UPLOAD_NOT_SUPPORTED'
      }, { status: 400 });
    }

    // 如果有S3配置，使用S3上传
    const { S3Storage } = await import('coze-coding-dev-sdk');
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    // 验证文件类型
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      pdf: ['application/pdf'],
    };

    const validTypes = allowedTypes[type as keyof typeof allowedTypes] || allowedTypes.image;
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${type}/${timestamp}_${randomStr}.${ext}`;

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传文件
    const contentType = file.type || 'application/octet-stream';
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: contentType,
    });

    // 生成访问URL
    const url = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 86400 * 365, // 1年有效期
    });

    return NextResponse.json({
      success: true,
      key: fileKey,
      url: url,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
