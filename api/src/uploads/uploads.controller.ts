import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';

const allowedMimeTypes = new Set([
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

@Controller('uploads')
export class UploadsController {
  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) return callback(new BadRequestException('Formato de imagem não permitido'), false);
        callback(null, true);
      },
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Envie uma imagem de até 2 MB');
    const baseUrl = process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 3333}`;
    return { url: `${baseUrl}/uploads/${file.filename}`, name: file.originalname, size: file.size };
  }
}
