import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService implements OnModuleInit {
  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(fileBuffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          // Cloudinary's SDK rejects with a plain object ({message, http_code,
          // name}), not an Error — wrapping it means both the caught
          // exception's .message is meaningful AND the original shape is
          // still visible via .cause for logging (see http-exception.filter.ts's
          // describeException, which needed this fix too — a raw object
          // rejection was logging as an unhelpful "[object Object]").
          if (error || !result) {
            const reason =
              error && typeof error === 'object' && 'message' in error
                ? String((error as { message: unknown }).message)
                : 'Unknown Cloudinary error';
            return reject(
              new Error(`Cloudinary upload failed: ${reason}`, {
                cause: error,
              }),
            );
          }
          resolve(result.secure_url);
        },
      );
      stream.end(fileBuffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
