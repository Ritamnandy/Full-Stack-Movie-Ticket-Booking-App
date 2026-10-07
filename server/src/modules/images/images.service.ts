import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from '@imagekit/nodejs';
import sharp from 'sharp';
import { Multer } from 'multer';
@Injectable()
export class ImagesService
{
    private readonly logger = new Logger( ImagesService.name );
    private readonly imageKit: ImageKit;

    constructor ( private readonly configService: ConfigService )
    {
        this.imageKit = new ImageKit( {
            privateKey: this.configService.getOrThrow<string>(
                'IMAGEKIT_PRIVATE_KEY',
            ),
        } );
    }

    async uploadImage (
        file: Express.Multer.File,
        folder: string,
    )
    {
        try
        {
            if ( !file )
            {
                throw new BadRequestException( 'Image is required' );
            }

            const allowedMimeTypes = [
                'image/jpeg',
                'image/png',
                'image/webp',
            ];

            if ( !allowedMimeTypes.includes( file.mimetype ) )
            {
                throw new BadRequestException(
                    'Only JPEG, PNG and WebP images are allowed',
                );
            }

            const maxSize = 5 * 1024 * 1024;

            if ( file.size > maxSize )
            {
                throw new BadRequestException(
                    'Image size must be less than 5MB',
                );
            }
            // Compress + resize image
            const compressedImage = await sharp( file.buffer )
                .resize( {
                    width: 1200,
                    height: 1200,
                    fit: 'inside',
                    withoutEnlargement: true,
                } )
                .webp( {
                    quality: 80,
                } )
                .toBuffer();

            this.logger.log(
                `Original: ${ ( file.size / 1024 ).toFixed( 2 ) } KB`,
            );

            this.logger.log(
                `Compressed: ${ ( compressedImage.length / 1024 ).toFixed( 2 ) } KB`,
            );

            const result = await this.imageKit.files.upload( {
                file: compressedImage.toString( 'base64' ),
                fileName: `${ Date.now() }-${ file.originalname }`,
                folder,
                useUniqueFileName: true,
            } );

            return {
                url: result.url,
                fileId: result.fileId,
                name: result.name,
                width: result.width,
                height: result.height,
            };
        } catch ( error )
        {
            if ( error instanceof BadRequestException )
            {
                throw error;
            }

            throw new InternalServerErrorException(
                'Image upload failed',
            );
        }
    }


    // Delete
    async deleteImage ( fileId: string )
    {
        try
        {
            if ( !fileId )
            {
                throw new BadRequestException(
                    'Image fileId is required',
                );
            }

            await this.imageKit.files.delete( fileId );

            return {
                success: true,
                message: 'Image deleted successfully',
            };
        } catch ( error )
        {
            if ( error instanceof BadRequestException )
            {
                throw error;
            }

            throw new InternalServerErrorException(
                'Image deletion failed',
            );
        }
    }
}
