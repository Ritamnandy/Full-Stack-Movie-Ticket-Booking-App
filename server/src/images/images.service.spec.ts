import { BadRequestException } from '@nestjs/common';
import { ImagesService } from './images.service.js';

describe('ImagesService', () => {
  let service: ImagesService;

  beforeEach(() => {
    service = Object.create(ImagesService.prototype) as ImagesService;
  });

  it('requires an image file before processing it', async () => {
    await expect(service.uploadImage(undefined as never, '/profiles')).rejects.toThrow(new BadRequestException('Image is required'));
  });

  it('rejects unsupported image types before uploading', async () => {
    const file = { mimetype: 'application/pdf', size: 10 } as Express.Multer.File;

    await expect(service.uploadImage(file, '/profiles')).rejects.toThrow('Only JPEG, PNG and WebP images are allowed');
  });

  it('requires a file id before deleting an image', async () => {
    await expect(service.deleteImage('')).rejects.toThrow('Image fileId is required');
  });
});
