import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as ffmpeg from 'ffmpeg';
import * as sharp from 'sharp';
import * as fluentmpeg from 'fluent-ffmpeg';
import { resolve } from 'node:path';

export class Thumbs {
    //filePath:string;
    //tempDirectory:string;
    thumbnailInterval:Number;
    thumbnailsPerRow:number;
    thumbnailWidth:number;
    thumbnailHeight:number;

    constructor(options) {
        //this.filePath = filePath;
        //this.tempDirectory = path.join(os.tmpdir(), 'video-thumbnail-gallery', path.basename(filePath));
        this.thumbnailInterval = options.thumbnailInterval || 30;
        this.thumbnailsPerRow = options.thumbnailsPerRow || 10;
        this.thumbnailWidth = options.thumbnailWidth || (!!options.thumbnailHeight ? 0 : 120);
        this.thumbnailHeight = options.thumbnailHeight || (!!options.thumbnailWidth ? 0 : 66);
      }

      private _MakeDirectory(path:string):Promise<any> {
        return new Promise((resolve,reject)=>{
          fs.mkdir(path, {recursive: true}, function(err) {
            if(err==null)
            {
              resolve(path);
            }
            else
            {
              reject(err);  
            }
          });
        });
      };

      private _GenerateTempFiles(sourcePath:string,tempdirPath:string):Promise<any>{
        return new Promise((resolve,reject)=>{
          fluentmpeg(sourcePath).on('error', function(err) {
            reject(err);
          }).on('end',()=>{
            resolve('success');
          }).screenshots({
            filename: 'thumbnail-at-%s-seconds.png',
            folder: tempdirPath,
            size: '320x240',
            count: 9
          });
        });
      }

      GenerateGalleryImage(sourcePath:string,thumbnailPath:string):Promise<any>{
        return new Promise((resolve,reject)=>{
          let tempDirectory = path.resolve(__dirname,'temp',path.parse(sourcePath).name);
          this._MakeDirectory(tempDirectory).then((status)=>{
              this._GenerateTempFiles(sourcePath,tempDirectory).then((status)=>{
                resolve(status);
              });
            });
        });
      }

      // generateThumbnails(cb) {
      //   const self = this;
    
      //   fs.mkdir(self.tempDirectory, {recursive: true}, function(err) {
      //     try {
      //       const process = new ffmpeg(self.filePath);
      //       process.then(function(video) {
      //         video.fnExtractFrameToJPG(self.tempDirectory, {
      //           frame_rate: '1/30',
      //           size: self.thumbnailWidth + 'x' + self.thumbnailHeight,
      //           file_name: '%s',
      //         }, function(err, files) {
      //           cb(err, files);
      //         });
      //       }, function(err) {
      //         cb(err, null);
      //       });
      //     } catch (ex) {
      //       cb(ex, null);
      //     }
      //   });
      // }
    
      combineThumbnails(files, outputFile, cb) {
        const compositeInput = [];
        let xOffset = 0;
        let yOffset = 0;
    
        if (files.length === 0) {
          cb(null, null);
          return;
        }
    
        for (let i = 0; i < files.length; i++) {
          compositeInput.push({
            input: files[i],
            left: xOffset,
            top: yOffset,
          });
    
          xOffset += this.thumbnailWidth;
          if ((i + 1) % this.thumbnailsPerRow === 0) {
            xOffset = 0;
            yOffset += this.thumbnailHeight;
          }
        }
    
        sharp({
          create: {
            width: this.thumbnailsPerRow * this.thumbnailWidth,
            height: Math.ceil(files.length / this.thumbnailsPerRow) * this.thumbnailHeight,
            channels: 3,
            background: '#000',
          },
        }).composite(compositeInput).toFile(outputFile, function(err, output) {
          if (!!err) {
            cb(err, null);
            return;
          }
    
          cb(null, output);
        });
      }
    
      // generateGallery(outputFile, cb) {
      //   const self = this;
      //   self.generateThumbnails(function(err, files) {
      //     if (!!err) {
      //       cb(err, null);
      //       return;
      //     }
    
      //     self.combineThumbnails(files, outputFile, cb);
      //   });
      // }
}