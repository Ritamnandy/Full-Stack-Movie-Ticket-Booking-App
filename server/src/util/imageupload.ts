// utils/imagekit.ts
import ImageKit, { toFile } from '@imagekit/nodejs';
import sharp from 'sharp';

const imageKit = new ImageKit( {
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
} );

interface UploadImageOptions
{
    folder?: string;   // e.g. "/avatars"
    width?: number;
    height?: number;
    quality?: number;
}

export interface UploadedImage
{
    url: string;
    fileId: string;
}

export async function uploadImage (
    buffer: Buffer,
    originalName: string,
    { folder = '/uploads', width = 800, height, quality = 80 }: UploadImageOptions = {}
): Promise<UploadedImage>
{
    // 1. Process: fix rotation, resize, convert to webp, strip metadata
    const processed = await sharp( buffer )
        .rotate()
        .resize( { width, height, fit: 'cover', withoutEnlargement: true } )
        .webp( { quality } )
        .toBuffer();

    // 2. Build a clean file name
    const baseName = originalName.replace( /\.[^/.]+$/, '' ).replace( /[^a-zA-Z0-9_-]/g, '' );
    const fileName = `${ baseName || 'image' }.webp`;

    // 3. Upload
    const response = await imageKit.files.upload( {
        file: await toFile( processed, fileName ),
        fileName,
        folder,
        useUniqueFileName: true,
    } );

    if ( !response.url || !response.fileId )
    {
        throw new Error( 'Image upload failed' );
    }

    return { url: response.url, fileId: response.fileId };
}

export async function deleteImage ( fileId: string ): Promise<void>
{
    try
    {
        await imageKit.files.delete( fileId );
    } catch ( error )
    {
        // Don't fail the request if cleanup fails
        console.error( 'ImageKit delete failed:', error );
    }
}