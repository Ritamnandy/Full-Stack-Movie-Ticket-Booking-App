import { Module } from '@nestjs/common';
import { ImagesService } from './images.service.js';

@Module( {
  providers: [ ImagesService ],
  exports: [ ImagesService ]
} )
export class ImagesModule { }
