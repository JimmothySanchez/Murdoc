import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as ffmpeg from 'ffmpeg';
import * as sharp from 'sharp';
import * as fluentmpeg from 'fluent-ffmpeg';
import { resolve } from 'node:path';

export class Thumbs {
  thumbnailCount: Number;
  thumbnailsPerRow: number;
  thumbnailWidth: number;
  thumbnailHeight: number;

  constructor(options) {
    this.thumbnailCount = options.thumbnailCount || 30;
    this.thumbnailsPerRow = options.thumbnailsPerRow || 10;
    this.thumbnailWidth = options.thumbnailWidth || (!!options.thumbnailHeight ? 0 : 120);
    this.thumbnailHeight = options.thumbnailHeight || (!!options.thumbnailWidth ? 0 : 66);
  }

  private _MakeDirectory(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.mkdir(path, { recursive: true }, function (err) {
        if (err == null) {
          resolve(path);
        }
        else {
          reject(err);
        }
      });
    });
  };

  private _CleanUpTemporaryFiles(path:string):Promise<any> {
    return new Promise((resolve, reject) => {
      fs.rmdir(path,()=>{

      });
    });
  }

  private _GenerateTempFiles(sourcePath: string, tempdirPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let filenames = [];
      fluentmpeg(sourcePath).on('error', function (err) {
        reject(err);
      }).on('filenames', (names) => {
        names.forEach(name => {
          filenames.push(path.resolve(tempdirPath,name));
        });
      }).on('end', () => {
        resolve(filenames);
      }).screenshots({
        filename: 't-%s.png',
        folder: tempdirPath,
        size: this.thumbnailWidth+'x'+this.thumbnailHeight,
        count: this.thumbnailCount
      });
    });
  }

  private _CombineThumbs(filenames: string[], thumbnailPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const compositeInput = [];
      let xOffset = 0;
      let yOffset = 0;

      if (filenames.length === 0) {
        resolve('No files');
      }

      for (let i = 0; i < filenames.length; i++) {
        compositeInput.push({
          input: filenames[i],
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
          height: Math.ceil(filenames.length / this.thumbnailsPerRow) * this.thumbnailHeight,
          channels: 3,
          background: '#000',
        },
      }).composite(compositeInput).toFile(thumbnailPath, function (err, output) {
        if (err == null) {
          resolve('Success');
        }
        else
        {
          reject(err);
        }
      });
      
    });
  }

  GenerateGalleryImage(sourcePath: string, thumbnailPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let tempDirectory = path.resolve(__dirname, 'temp', path.parse(sourcePath).name);
      //Make the directory
      this._MakeDirectory(tempDirectory).then((dirStatus) => {
        //Then generate temporary files
        this._GenerateTempFiles(sourcePath, tempDirectory).then((fileNames) => {
          //Then generate merge image
          this._CombineThumbs(fileNames,thumbnailPath).then((combineStatus)=>{
            this._CleanUpTemporaryFiles(tempDirectory);
            resolve(combineStatus);
            //Then clean up
          });
        });
      });
    });
  }
}